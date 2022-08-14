%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.bool import TRUE, FALSE

from src.forms import Question
from src.forms import view_test_count
from src.forms import view_question_count
from src.forms import view_questions
from src.forms import create_test
from src.forms import ready_test
from src.forms import add_question
from src.forms import add_correct_answer
from src.forms import send_answer
from src.forms import _get_answer_for_id
from src.forms import view_question
from src.forms import view_count_users_test
from src.forms import view_user_test
from src.forms import view_points_user_test
from starkware.starknet.common.syscalls import get_caller_address

@external
func test_sum{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():
    alloc_locals
    let (test_id) = create_test(1)
    let (question_id) = add_question(test_id, 00, 11, 22, 33, 44)
    let (question_id2) = add_question(test_id, 00, 11, 22, 33, 44)

    local array : felt* = new (3, 1)
    add_correct_answer(test_id, 2, array)

    ready_test(test_id)

    let (count_questions) = view_question_count(test_id)
    assert count_questions = 2

    let (question : Question) = view_question(0, 0)
    assert question.description = 00
    assert question.optionA = 11
    assert question.optionB = 22
    assert question.optionC = 33
    assert question.optionD = 44

    local array2 : felt* = new (3, 1)
    send_answer(test_id, 2, array2)

    let (count_users) = view_count_users_test(test_id)
    assert count_users = 1

    let (user_test) = view_user_test(0)
    assert user_test = TRUE

    let (point) = view_points_user_test(test_id)
    assert point = 10

    return ()
end