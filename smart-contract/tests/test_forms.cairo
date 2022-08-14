%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin

from src.forms import Question
from src.forms import view_test_count
from src.forms import view_question_count
from src.forms import view_questions
from src.forms import create_test
from src.forms import add_question
from src.forms import add_correct_answer
from src.forms import points
from src.forms import _get_answer_for_id
from src.forms import view_question

@external
func test_sum{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():
    alloc_locals
    let (test_id) = create_test(1)
    let (question_id) = add_question(test_id, 00, 11, 22, 33, 44)
    let (question_id2) = add_question(test_id, 00, 11, 22, 33, 44)

    local array : felt* = new (3, 1)
    add_correct_answer(test_id, 2, array)

    let (count_questions) = view_question_count(test_id)
    assert count_questions = 2

    let (question : Question) = view_question(0, 0)
    assert question.description = 00
    assert question.optionA = 11
    assert question.optionB = 22
    assert question.optionC = 33
    assert question.optionD = 44

    local array2 : felt* = new (3, 1)
    let (point) = points(test_id, 2, array2)
    assert point = 10
    return ()
end