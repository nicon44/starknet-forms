%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256

// questions list
@storage_var
func QuestionStorage_list(form_id: felt) -> (question_id: Uint256) {
}

// amount of questions in form
@storage_var
func QuestionStorage_count(form_id: felt) -> (questions_count: felt) {
}

namespace QuestionStorage {
    //
    // Reads
    //

    func list_read{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt) -> (question_id: Uint256) {
        let (question_id) = QuestionStorage_list.read(form_id);
        return (question_id,);
    }

    func count_read{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt) -> (questions_count: felt) {
        let (questions_count) = QuestionStorage_count.read(form_id);
        return (questions_count,);
    }

    //
    // Writes
    //

    func list_write{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt, question_id: Uint256) {
        QuestionStorage_list.write(form_id, question_id);
        return();
    }

    func count_write{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(form_id: felt, questions_count: felt) {
        QuestionStorage_count.write(form_id, questions_count);
        return();
    }
}