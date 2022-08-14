%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.alloc import alloc
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.bool import TRUE, FALSE

#
# Events
#

#
# Struct
#

struct Test:
    member name : felt
    member created_at : felt
    member open : felt
end

struct Question:
    member description : felt
    member optionA : felt
    member optionB : felt
    member optionC : felt
    member optionD : felt
end

#
# Storage
#
@storage_var
func tests(id_test : felt) -> (test : Test):
end

@storage_var
func tests_count() -> (count : felt):
end

@storage_var
func questions(id_test : felt, id_question : felt) -> (question : Question):
end

@storage_var
func questions_count(id_test : felt) -> (questions_count : felt):
end

@storage_var
func correct_test_answers(id_test : felt, id_question : felt) -> (correct_test_answer: felt):
end

@storage_var
func count_users_test(id_test : felt) -> (count_users : felt):
end

@storage_var
func check_users_test(user_address : felt, id_test : felt) -> (bool : felt):
end

@storage_var
func points_users_test(user_address : felt, id_test : felt) -> (points : felt):
end

@storage_var
func answer_users_test(user_address : felt, id_test : felt, id_question : felt) -> (
    answer : felt
):
end

#
# Initializer
#

#
# Modifier
#

func assert_only_owner{
    syscall_ptr : felt*,
    pedersen_ptr : HashBuiltin*,
    range_check_ptr
}(id_test: felt):
    let (t : Test) = tests.read(id_test)
    let (caller) = get_caller_address()
    with_attr error_message("Ownable: caller is not the owner"):
        assert t.created_at = caller
    end
    return ()
end

func test_open{
    syscall_ptr : felt*,
    pedersen_ptr : HashBuiltin*,
    range_check_ptr
}(id_test: felt):
    let (t : Test) = tests.read(id_test)
    with_attr error_message("Test: is closed"):
        assert t.open = TRUE
    end
    return ()
end

func test_closed{
    syscall_ptr : felt*,
    pedersen_ptr : HashBuiltin*,
    range_check_ptr
}(id_test: felt):
    let (t : Test) = tests.read(id_test)
    with_attr error_message("Test: is open"):
        assert t.open = FALSE
    end
    return ()
end

#
# Getters
#

@view
func view_test{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_test : felt
) -> (test : Test):
    let (res : Test) = tests.read(id_test)
    return (res)
end

@view
func view_test_count{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    count : felt
):
    let (count) = tests_count.read()
    return (count)
end

@view
func view_question_count{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_test : felt
) -> (bet_count : felt):
    let (count) = questions_count.read(id_test)
    return (count)
end

@view
func view_question{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_test : felt, id_question : felt
) -> (question : Question):
    let (question : Question) = questions.read(id_test, id_question)
    return (question)
end

@view
func view_questions{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_test : felt
) -> (records_len : felt, records : Question*):
    alloc_locals

    let (records : Question*) = alloc()
    let (count_question) = questions_count.read(id_test)
    _recurse_view_solution_records(id_test, count_question, records, 0)

    return (count_question, records)
end

@view
func view_count_users_test{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_test : felt
) -> (count_user : felt):
    let (count) = count_users_test.read(id_test)
    return (count)
end

@view
func view_user_test{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_test : felt
) -> (bool : felt):
    let (caller_address) = get_caller_address()
    let (bool) = check_users_test.read(caller_address, id_test)
    return (bool)
end

@view
func view_points_user_test{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_test : felt
) -> (points : felt):
    let (caller_address) = get_caller_address()
    let (points) = points_users_test.read(caller_address, id_test)
    return (points)
end

#
# Externals
#

@external
func create_test{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    name : felt
) -> (id_test : felt):

    let (id_test) = tests_count.read()
    let (caller_address) = get_caller_address()
    tests.write(id_test, Test(name, caller_address, TRUE))
    tests_count.write(id_test + 1)
    return (id_test)
end

@external
func add_question{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_test : felt,
    description : felt,
    optionA : felt,
    optionB : felt,
    optionC : felt,
    optionD : felt,
) -> (id_question : felt):

    assert_only_owner(id_test)
    test_open(id_test)

    let (id_question) = questions_count.read(id_test)
    questions.write(
        id_test,
        id_question,
        Question(
        description,
        optionA,
        optionB,
        optionC,
        optionD
        ),
    )
    questions_count.write(id_test, id_question + 1)

    return (id_question)
end

@external
func add_correct_answer{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_test : felt, answers_len : felt, answers : felt*
) -> ():
    assert_only_owner(id_test)
    test_open(id_test)

    let (count_question) = questions_count.read(id_test)
    _recurse_add_correct_answer(id_test, count_question, answers, 0)

    let (t : Test) = tests.read(id_test)
    tests.write(id_test, Test(t.name, t.created_at, FALSE))

    return ()
end

@view
func send_answer{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_test : felt, answers_len : felt, answers : felt*
) -> ():

    test_closed(id_test)

    let (count_question) = questions_count.read(id_test)
    let (point) = _recurse_add_answers(id_test, count_question, answers, 0)


    let (caller_address) = get_caller_address()
    points_users_test.write(caller_address, id_test, point)
    check_users_test.write(caller_address, id_test, TRUE)

    let (count_users) = count_users_test.read(id_test)
    count_users_test.write(id_test, count_users + 1)

    return ()
end

#
# Unprotected
#

#
# Public
#

#
# Internal
#

func _recurse_view_solution_records{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr
}(id_test : felt, len : felt, arr : Question*, idx : felt) -> ():
    if idx == len:
        return ()
    end

    let (record : Question) = questions.read(id_test, idx)
    assert arr[idx] = record

    _recurse_view_solution_records(id_test, len, arr, idx + 1)
    return ()
end

func _recurse_add_correct_answer{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_test : felt, len : felt, arr : felt*, idx : felt
) -> ():
    if idx == len:
        return ()
    end

    correct_test_answers.write(id_test, idx, arr[idx])

    _recurse_add_correct_answer(id_test, len, arr, idx + 1)
    return ()
end

func _recurse_add_answers{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_test : felt, len : felt, arr : felt*, idx : felt
) -> (points : felt):
    alloc_locals
    if len == 0:
        return (0)
    end

    let (answer_correct) = correct_test_answers.read(id_test, idx)

    tempvar answer_user : felt
    answer_user = cast([arr], felt)

    let (caller_address) = get_caller_address()
    answer_users_test.write(caller_address, id_test, idx, answer_user)

    local t
    if answer_user == answer_correct:
        t = 5
    else:
        t = 0
    end
    let (local total) = _recurse_add_answers(id_test, len - 1, arr + 1, idx + 1)
    let res = t + total
    return (res)
end

func _get_answer_for_id{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    question : Question, id_answer : felt
) -> (correct_answer : felt):
    tempvar answer_user : felt
    if id_answer == 0:
        answer_user = question.optionA
    end
    if id_answer == 1:
        answer_user = question.optionB
    end
    if id_answer == 2:
        answer_user = question.optionC
    end
    if id_answer == 3:
        answer_user = question.optionD
    end
    return (answer_user)
end