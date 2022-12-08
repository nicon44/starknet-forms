%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256

// questions list
@storage_var
func QuestionStorage_list(id_form: felt, id_question: felt) -> (question: Uint256) {
}

// amount of questions in form
@storage_var
func QuestionStorage_count(id_form: felt) -> (questions_count: felt) {
}

namespace QuestionStorage {
    //
    // Reads
    //

    func list_read{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(id_form: felt, id_question: felt) -> (question: Uint256) {
        let (question) = QuestionStorage_list.read(id_form, id_question);
        return (question,);
    }

    func count_read{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(id_form: felt) -> (questions_count: felt) {
        let (questions_count) = QuestionStorage_count.read(id_form);
        return (questions_count,);
    }

    //
    // Writes
    //

    func list_write{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(id_form: felt, id_question: felt, question: Uint256) {
        QuestionStorage_list.write(id_form, id_question, question);
        return();
    }

    func count_write{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(id_form: felt, questions_count: felt) {
        QuestionStorage_count.write(id_form, questions_count);
        return();
    }
}