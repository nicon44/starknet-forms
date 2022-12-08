%lang starknet

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256
from starkware.cairo.common.math import assert_not_zero, assert_not_equal, assert_nn, assert_le, assert_lt, assert_in_range
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.bool import TRUE, FALSE


from contracts.constants.form_status import STATUS_CLOSED, STATUS_OPEN, STATUS_READY
from contracts.storage.form_storage import FormStorage
from contracts.storage.question_storage import QuestionStorage
from contracts.storage.user_storage import UserStorage
from contracts.types.data_types import DataTypes

//
// Asserts
//

//
// Public
//
func view_form{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt) -> (form: DataTypes.Form) {
    alloc_locals;

    let (count) = FormStorage.count_read();
    with_attr error_message("Form not found") {
        assert_in_range(form_id, 0, count);
    }

    let (form: DataTypes.Form) = FormStorage.list_read(form_id);

    return (form,);
}

func view_form_count{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (count: felt) {
    alloc_locals;
    let (count) = FormStorage.count_read();
    return (count,);
}

func view_row_form{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt) -> (records_len: felt, records: DataTypes.Row*) {
    alloc_locals;

    let (records: DataTypes.Row*) = alloc();
    let (count_users) = UserStorage.in_form_count_read(form_id);

    let (count_questions) = QuestionStorage.count_read(form_id);
    
    _recurse_view_row(form_id, count_users, records, 0, count_questions);

    return (count_users, records);
}

func create_form{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    name: felt, questions_len: felt, questions: Uint256*, status: felt)
    -> (form_id: felt) {
    alloc_locals;

    // status correct
    with_attr error_message("status can be 0 or 1") {
        assert_in_range(status, 0, 2);
    }

    with_attr error_message("the number of questions must be greater than 0") {
        assert_le(0, questions_len);
    }

    let (local form_id) = _create_form(name);
    _add_questions(form_id, questions_len, questions);
    
    if (status == STATUS_READY) {
        _change_status_ready_form(form_id, name);
    }
    // modifico la cantidad de forms que creo el usuario
    _add_count_user_forms();

    return (form_id,);
}

func update_form{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt,
    name: felt,
    dquestions_len: felt,
    dquestions: Uint256*,
    status: felt) -> () {
    alloc_locals;

    let (count) = FormStorage.count_read();
    with_attr error_message("Form not found") {
        assert_in_range(form_id, 0, count);
    }

    let (form: DataTypes.Form) = FormStorage.list_read(form_id);

    let (caller_address) = get_caller_address();
    with_attr error_message("Only the owner can modify") {
        assert form.created_at = caller_address;
    }

    with_attr error_message("the current state does not allow modifications") {
        assert form.status = STATUS_OPEN;
    }

    with_attr error_message("the number of questions must be greater than 0") {
        assert_le(0, dquestions_len);
    }

    _add_questions(form_id, dquestions_len, dquestions);

    if (status == STATUS_READY) {
        _change_status_ready_form(form_id, name);
    }

    return ();
}

func forms_change_status_ready{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt) -> () {
    let (count) = FormStorage.count_read();
    with_attr error_message("Form not found") {
        assert_in_range(form_id, 0, count);
    }

    let (form: DataTypes.Form) = FormStorage.list_read(form_id);

    let (caller_address) = get_caller_address();
    with_attr error_message("Only the owner can modify") {
        assert form.created_at = caller_address;
    }

    with_attr error_message("the current state does not allow modifications") {
        assert form.status = STATUS_OPEN;
    }

    _change_status_ready_form(form_id, form.name);
    return ();
}

func send_answer{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt, nickname: felt, answers_len: felt, answers: Uint256*) -> () {
    alloc_locals;

    let (count) = FormStorage.count_read();
    with_attr error_message("Form not found") {
        assert_in_range(form_id, 0, count);
    }

    let (form: DataTypes.Form) = FormStorage.list_read(form_id);

    with_attr error_message("the current state does not allow modifications") {
        assert form.status = STATUS_READY;
    }

    let (count_question) = QuestionStorage.count_read(form_id);
    with_attr error_message("Length of answers must be equal to the number of questions") {
        assert answers_len = count_question;
    }

    let (caller_address) = get_caller_address();
    let (bool) = UserStorage.check_form_bool_read(caller_address, form_id);
    with_attr error_message("You have already answered this form") {
        assert bool = FALSE;
    }

    _recurse_add_answers(form_id, count_question, answers, 0, caller_address);
    
    UserStorage.check_form_bool_write(caller_address, form_id, TRUE);
    UserStorage.nickname_form_bool_write(caller_address, form_id, nickname);
    
    // actualizo la cantidad de usuarios que respondieron el form
    let (count_users) = UserStorage.in_form_count_read(form_id);
    UserStorage.in_form_count_write(form_id, count_users + 1);

    UserStorage.completed_form_list_write(form_id, count_users, caller_address);

    return ();
}

func close_form{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt) -> () {
    alloc_locals;

    let (count) = FormStorage.count_read();
    with_attr error_message("Form not found") {
        assert_in_range(form_id, 0, count);
    }

    let (form: DataTypes.Form) = FormStorage.list_read(form_id);

    with_attr error_message("the current state does not allow modifications") {
        assert form.status = STATUS_READY;
    }

    _change_status_close_form(form_id, form.name);

    return ();
}

//
// Private
//

// Form
func _create_form{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    name: felt) -> (form_id: felt) {

    let (form_id) = FormStorage.count_read();
    let (caller_address) = get_caller_address();
    
    FormStorage.list_write(form_id, DataTypes.Form(form_id, name, caller_address, STATUS_OPEN));
    
    FormStorage.count_write(form_id + 1);
    return (form_id,);
}

func _change_status_ready_form{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt, name: felt) -> () {
    let (caller_address) = get_caller_address();
    FormStorage.list_write(form_id, DataTypes.Form(form_id, name, caller_address, STATUS_READY));
    return ();
}

func _change_status_close_form{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt, name: felt) -> () {
    let (caller_address) = get_caller_address();
    FormStorage.list_write(form_id, DataTypes.Form(form_id, name, caller_address, STATUS_CLOSED));
    return ();
}

func _add_questions{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt, questions_len: felt, questions: Uint256*) -> () {
    alloc_locals;

    let count_question = 0;
    _recursive_add_questions(form_id, count_question, questions_len, questions);
    QuestionStorage.count_write(form_id, count_question + questions_len);
    return ();
}

func _recursive_add_questions{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt, id_question: felt, questions_len: felt, questions: Uint256*) -> () {
    if (questions_len == 0) {
        return ();
    }

    QuestionStorage.list_write(form_id, id_question, [questions]);

    _recursive_add_questions(form_id, id_question + 1, questions_len - 1, questions + Uint256.SIZE);
    return ();
}

func _recurse_add_answers{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt, len: felt, arr: Uint256*, idx: felt, caller_address: felt) -> () {
    alloc_locals;
    if (len == 0) {
        return ();
    }

    // tempvar answer_user: Uint256;
    // answer_user = cast([arr], Uint256);

    UserStorage.answer_form_list_write(caller_address, form_id, idx, [arr]);

    _recurse_add_answers(form_id, len - 1, arr + 1, idx + 1, caller_address);
    return ();
}

func _recurse_view_row{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt, len: felt, arr: DataTypes.Row*, idx: felt, question_count: felt) -> () {
    if (idx == len) {
        return ();
    }

    let (user) = UserStorage.completed_form_list_read(form_id, idx);
    let (nickname) = UserStorage.nickname_form_bool_read(user, form_id);

    let (form: DataTypes.Form) = FormStorage.list_read(form_id);
    
    assert arr[idx] = DataTypes.Row(form_id, form.name, form.status, user, nickname);

    _recurse_view_row(form_id, len, arr, idx + 1, question_count);
    return ();
}

func _add_count_user_forms{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> () {
    let (caller_address: felt) = get_caller_address();
    let (count: felt) = UserStorage.in_form_count_read(caller_address);
    UserStorage.in_form_count_write(caller_address, count + 1);
    return ();
}






