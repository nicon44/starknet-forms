%lang starknet

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256

from contracts.constants.form_status import STATUS_CLOSED, STATUS_OPEN, STATUS_READY
from contracts.storage.form_storage import FormStorage
from contracts.storage.question_storage import QuestionStorage
from contracts.storage.user_storage import UserStorage
from contracts.types.data_types import DataTypes

//
// public
//

func view_my_forms{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user_address: felt) -> (records_len: felt, records: DataTypes.Form*) {
    alloc_locals;
    let (count: felt) = FormStorage.count_read();
    let (records: DataTypes.Form*) = alloc();
    _recurse_my_forms(user_address, 0, count, records, 0);
    let (count_forms) = UserStorage.created_forms_count_read(user_address);
    return (count_forms, records);
}

func view_users_form_answers{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    id_form: felt, user: felt) -> (records_len: felt, records: Uint256*) {
    alloc_locals;

    let (records: Uint256*) = alloc();
    let (count) = QuestionStorage.count_read(id_form);
    _recurse_view_users_form_answers(id_form, count, records, 0, user);

    return (count, records);
}

//
// Private
//

func _recurse_my_forms{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    user_address: felt, index: felt, len: felt, arr: DataTypes.Form*, idx: felt) -> () {
    if (index == len) {
        return ();
    }

    let (form: DataTypes.Form) = FormStorage.list_read(index);
    // If the form is created by me, I save it in the array.
    if (form.created_at == user_address) {
        assert arr[idx] = form;
        _recurse_my_forms(user_address, index + 1, len, arr, idx + 1);
        return ();
    } else {
        _recurse_my_forms(user_address, index + 1, len, arr, idx);
        return ();
    }
}

func _recurse_view_users_form_answers{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(id_form: felt, len: felt, arr: Uint256*, idx: felt, caller_address: felt) -> () {
    if (idx == len) {
        return ();
    }

    let (answer: Uint256) = UserStorage.answer_form_list_read(caller_address, id_form, idx);
    assert arr[idx] = answer;

    _recurse_view_users_form_answers(id_form, len, arr, idx + 1, caller_address);
    return ();
}

func _recurse_view_answers_records{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    id_form: felt, len: felt, arr: DataTypes.Row*, idx: felt, question_count: felt) -> () {
    if (idx == len) {
        return ();
    }

    let (user: felt) = UserStorage.completed_form_list_read(id_form, idx);
    let (nickname) = UserStorage.nickname_form_bool_read(user, id_form);
    let (form: DataTypes.Form) = FormStorage.list_read(id_form);

    assert arr[idx] = DataTypes.Row(id_form, form.name, form.status, user, nickname);

    _recurse_view_answers_records(id_form, len, arr, idx + 1, question_count);
    return ();
}