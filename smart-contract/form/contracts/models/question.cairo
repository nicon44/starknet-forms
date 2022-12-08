%lang starknet

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256

from contracts.storage.question_storage import QuestionStorage

//
// Public
//

func view_questions{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt) -> (records_len: felt, records: Uint256*) {
    alloc_locals;

    let (records: Uint256*) = alloc();
    let (count_question) = QuestionStorage.count_read(form_id);
    _recurse_view_question(form_id, count_question, records, 0);

    return (count_question, records);
}

func view_questions_count{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt) -> (count: felt) {
    alloc_locals;

    let (count_question) = QuestionStorage.count_read(form_id);

    return (count_question,);
}

// Internal

func _recurse_view_question{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt, len: felt, arr: Uint256*, idx: felt) -> () {
    if (idx == len) {
        return ();
    }

    let (record: Uint256) = QuestionStorage.list_read(form_id, idx);
    assert arr[idx] = record;

    _recurse_view_question(form_id, len, arr, idx + 1);
    return ();
}