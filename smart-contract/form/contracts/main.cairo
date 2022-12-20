%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256

from contracts.models.form import view_form, view_form_count, create_form, update_form, forms_change_status_ready, send_answer, close_form
from contracts.models.question import view_questions, view_questions_count  
from contracts.models.user import view_my_forms, view_answer_from_user
from contracts.types.data_types import DataTypes

//
// View
// 

@view
func get_form{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt) -> (form: DataTypes.Form) {
    let (form: DataTypes.Form) = view_form(form_id);
    return (form,);
}

@view
func get_forms_count{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (form_count: felt) {
    let (form_count) = view_form_count();
    return (form_count,);
}

@view
func get_question{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt) -> (question_id: Uint256) {
    let (question_id: Uint256) = view_questions(form_id);
    return (question_id,);
}

@view
func get_questions_count{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt) -> (questions_count: felt) {
    let (questions_count) = view_questions_count(form_id);
    return (questions_count,);
}

@view
func get_my_forms{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(user_address: felt) -> (records_len: felt, records: DataTypes.Form*) {
    let (records_len, records: DataTypes.Form*) = view_my_forms(user_address);
    return (records_len, records,);
}

@view
func get_answer{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt, user_address: felt) -> (answer_id: Uint256) {
    let (answer_id: Uint256) = view_answer_from_user(form_id, user_address);
    return (answer_id,);
}

//
// External
//

@external
func form_create{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(name: felt, question_id: Uint256, questions_count: felt, status: felt) -> (form_id: felt) {
    let (form_id) = create_form(name, question_id, questions_count, status);
    return (form_id,);
}

@external
func form_update{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt, name: felt, question_id: Uint256, questions_count: felt, status: felt) -> () {
    update_form(form_id, name, question_id, questions_count, status);
    return ();
}

@external
func form_ready{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt) -> () {
    forms_change_status_ready(form_id);
    return ();
}

@external
func form_send_answer{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt, nickname: felt, answer_id: Uint256) -> () {
    send_answer(form_id, nickname, answer_id);
    return ();
}

@external
func form_close{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt) -> () {
    close_form(form_id);
    return ();
}