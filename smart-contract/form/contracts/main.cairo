%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256

from contracts.models.form import view_form, view_form_count, create_form, update_form, forms_change_status_ready, send_answer, close_form
from contracts.models.question import view_questions, view_questions_count  
from contracts.models.user import view_my_forms, view_users_form_answers
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
func get_forms_count{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt) -> (form_count: felt) {
    let (form_count) = view_form_count();
    return (form_count,);
}

@view
func get_questions{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt) -> (records_len: felt, records: Uint256*) {
    let (records_len: felt, records: Uint256*) = view_questions(form_id);
    return (records_len, records,);
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
func get_answers{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt, user_address: felt) -> (records_len: felt, records: Uint256*) {
    let (records_len, records: Uint256*) = view_users_form_answers(form_id, user_address);
    return (records_len, records,);
}

//
// External
//

@external
func form_create{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(name: felt, questions_len: felt, questions: Uint256*, status: felt) -> (form_id: felt) {
    let (form_id) = create_form(name, questions_len, questions, status);
    return (form_id,);
}

@external
func form_update{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt, name: felt, questions_len: felt, questions: Uint256*, status: felt) -> () {
    update_form(form_id, name, questions_len, questions, status);
    return ();
}

@external
func form_ready{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt) -> () {
    forms_change_status_ready(form_id);
    return ();
}

@external
func form_send_answer{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt, nickname: felt, answers_len: felt, answers: Uint256*) -> () {
    send_answer(form_id, nickname, answers_len, answers);
    return ();
}

@external
func form_close{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt) -> () {
    close_form(form_id);
    return ();
}



