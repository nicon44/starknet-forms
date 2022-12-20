%lang starknet

from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256

from contracts.storage.question_storage import QuestionStorage

//
// Public
//

func view_questions{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt) -> (question_id: Uint256) {
    alloc_locals;
    let (question_id: Uint256) = QuestionStorage.list_read(form_id);
    return (question_id,);
}

func view_questions_count{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    form_id: felt) -> (count: felt) {
    alloc_locals;

    let (count_question) = QuestionStorage.count_read(form_id);

    return (count_question,);
}