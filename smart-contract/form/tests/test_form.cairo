%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.bool import TRUE, FALSE
from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.uint256 import Uint256

from contracts.main import form_create, get_form, get_forms_count, get_question, get_questions_count, get_my_forms, form_send_answer, get_answers
from contracts.constants.form_status import STATUS_CLOSED, STATUS_OPEN, STATUS_READY
from contracts.types.data_types import DataTypes

@external
func test_create_form{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    alloc_locals;
    
    let account = 0x1111;
    %{ end_prank = start_prank(ids.account) %}

    let name = 'test'; 
    let question_id = Uint256(100, 0 );
    let questions_count = 1;

    let (form_id) = form_create(name, question_id, questions_count, STATUS_READY);
    let (form: DataTypes.Form) = get_form(form_id);

    assert form.name = name;
    assert form.created_at = account;
    %{ end_prank() %}

    let (form_count) = get_forms_count();
    assert form_count = 1;

    let (question_id_ret: Uint256) = get_question(form_id);
    assert question_id_ret = question_id;

    let (questions_count_ret) = get_questions_count(form_id);
    assert questions_count_ret = questions_count;


    return ();
}

@external
func test_my_forms{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    alloc_locals;
    
    let account = 0x1111;
    %{ end_prank = start_prank(ids.account) %}

    let name = 'test'; 
    let question_id = Uint256(100, 0 );
    let questions_count = 1;

    let (form_id_1) = form_create(name, question_id, questions_count, STATUS_READY);

    let (form_count) = get_forms_count();
    assert form_count = 1;

    let (form_id_2) = form_create(name, question_id, questions_count, STATUS_READY);
    
    let (form_count) = get_forms_count();
    assert form_count = 2;

    
    %{ end_prank() %}


    let (records_len: felt, records: DataTypes.Form*) = get_my_forms(account);
    assert records_len = 2;

    return ();
}

@external
func test_send_answer{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    alloc_locals;
    
    let account = 0x1111;
    let account_user_a = 0x2222;
    let account_user_b = 0x3333;
    
    // create form
    %{ end_prank = start_prank(ids.account) %}

    let name = 'test'; 
    let question_id = Uint256(100, 0 );
    let questions_count = 1;

    let (form_id) = form_create(name, question_id, questions_count, STATUS_READY);
    
    %{ end_prank() %}

    // send answer from user a
    %{ end_prank = start_prank(ids.account_user_a) %}
    form_send_answer(form_id, 'Bob', Uint256(200, 0 ));
    %{ end_prank() %}

    // send answer from user b
    %{ end_prank = start_prank(ids.account_user_b) %}
    form_send_answer(form_id, 'Alice', Uint256(300, 0 ));
    %{ end_prank() %}

    // get answers
    let (records_len: felt, records: DataTypes.Row*) = get_answers(form_id);
    assert records_len = 2;

    return ();
}