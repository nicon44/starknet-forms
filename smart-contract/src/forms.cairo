%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.alloc import alloc
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.bool import TRUE, FALSE
from starkware.cairo.common.math import (
    assert_not_zero,
    assert_not_equal,
    assert_nn,
    assert_le,
    assert_lt,
    assert_in_range,
)
from starkware.cairo.common.hash import hash2

from src.common.utils import Question, Form, Row

#
# Constants
#

const STATUS_READY = 'ready'
const STATUS_OPEN = 'open'
const STATUS_CLOSED = 'closed'

#
# Events
#

@event
func FormCreated(id_form: felt):
end

@event
func SendPoint(id_form: felt, point: felt):
end

#
# Storage
#

# forms list
@storage_var
func forms(id_form: felt) -> (form: Form):
end

# amount of forms
@storage_var
func forms_count() -> (count: felt):
end

# questions list
@storage_var
func questions(id_form: felt, id_question: felt) -> (question: Question):
end

# amount of questions in form
@storage_var
func questions_count(id_form: felt) -> (questions_count: felt):
end

# list of users who completed the form
@storage_var
func users_form(id_form: felt, count_user: felt) -> (user: felt):
end

# amount of users in form
@storage_var
func count_users_form(id_form: felt) -> (count_users: felt):
end

# amount of forms you create
@storage_var
func count_forms_by_user(user_address: felt) -> (count_forms: felt):
end

# users who completed the form / bool
@storage_var
func check_users_form(user_address: felt, id_form: felt) -> (bool: felt):
end

# users who completed the form / nickname
@storage_var
func nickname_users_form(user_address: felt, id_form: felt) -> (nickname: felt):
end

# points of a user obtained in a form
@storage_var
func points_users_form(user_address: felt, id_form: felt) -> (points: felt):
end

# responses from a user for a form
@storage_var
func answer_users_form(user_address: felt, id_form: felt, id_question : felt) -> (
    answer : felt
):
end

#
# Getters
#

@view
func view_form{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form: felt
) -> (form: Form):
    let (res: Form) = forms.read(id_form)
    return (res)
end

@view
func view_count_forms_by_user{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    user_address: felt
) -> (res: felt):
    let (count_users_form: felt) = count_forms_by_user.read(user_address)
    return (count_users_form)
end

@view
func view_my_forms{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    user_address: felt
) -> (records_len: felt, records: Form*):
    alloc_locals
    let (count: felt) = forms_count.read()
    let (records: Form*) = alloc()
    _recurse_my_forms(user_address, 0, count, records, 0)
    let (count_forms) = count_forms_by_user.read(user_address)
    return (count_forms, records)
end

@view
func view_form_count{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (
    count : felt
):
    let (count) = forms_count.read()
    return (count)
end

@view
func view_question{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form : felt,
    id_question : felt
) -> (question: Question):

    let (question : Question) = questions.read(id_form, id_question)
    return (question)
end

@view
func view_questions{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form : felt
) -> (records_len : felt, records : Question*):
    alloc_locals

    let (records : Question*) = alloc()
    let (count_question) = questions_count.read(id_form)
    _recurse_view_question_dto(id_form, count_question, records, 0)

    return (count_question, records)
end

@view
func view_question_count{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form : felt
) -> (question_count : felt):
    let (count) = questions_count.read(id_form)
    return (count)
end

@view
func view_users_form_count{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form : felt
) -> (count_user : felt):

    let (count) = count_users_form.read(id_form)
    return (count)
end

@view
func view_score_form{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form : felt
) -> (records_len : felt, records : Row*):
    alloc_locals

    let (records : Row*) = alloc()
    let (count) = count_users_form.read(id_form)
    _recurse_view_answers_records(id_form, count, records, 0)

    return (count, records)
end

@view
func view_score_form_user{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form : felt, user: felt
) -> (point: felt):
    let (point) = points_users_form.read(user, id_form)
    return (point)
end

@view
func view_correct_form_answers{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form : felt
) -> (records_len : felt, records : felt*):
    alloc_locals

    let (records : felt*) = alloc()
    let (count) = questions_count.read(id_form)
    _recurse_view_correct_form_answers(id_form, count, records, 0)

    return (count, records)
end

@view
func view_users_form_answers{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form : felt,
    user: felt
) -> (records_len : felt, records : felt*):
    alloc_locals

    let (records : felt*) = alloc()
    let (count) = questions_count.read(id_form)
    _recurse_view_users_form_answers(id_form, count, records, 0, user)

    return (count, records)
end

@view
func view_my_score_forms_completed{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    user_address: felt
) -> (records_len: felt, records: Row*):
    alloc_locals
    let (count: felt) = forms_count.read()
    let (records: Row*) = alloc()
    _recurse_my_score_forms_completed(user_address, 0, count, records, 0)
    let (count_forms_completed) = _recurse_count_my_score_forms_completed(user_address, 0, count, records)
    return (count_forms_completed, records)
end

#
# Externals
#

@external
func create_form{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    name: felt,
    dquestions_len: felt,
    dquestions: Question*,
    status_open: felt,
    secret_hash: felt
) -> (id_form: felt):
    alloc_locals
    
    # status correct
    with_attr error_message("status can be 0 or 1"):
        assert_in_range(status_open, 0, 2)
    end
    with_attr error_message("the number of questions must be greater than 0"):
        assert_le(0, dquestions_len)
    end

    let (local id_form) = _create_form(name, secret_hash)
    _add_questions(id_form, dquestions_len, dquestions)
    if status_open == 0:
        _change_status_ready_form(id_form, name, secret_hash)
    end
    _add_count_user_forms()
    FormCreated.emit(id_form)
    return (id_form)
end

@external
func updated_form{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form: felt,
    name: felt,
    dquestions_len: felt,
    dquestions: Question*,
    status_open: felt,
    secret_hash: felt
) -> (id_form: felt):
    alloc_locals


    let (count) = forms_count.read()
    with_attr error_message("Form not found"):
        assert_in_range(id_form, 0, count)
    end

    let (form: Form) = forms.read(id_form)
    
    let (caller_address) = get_caller_address()
    with_attr error_message("Only the owner can modify"):
        assert form.created_at = caller_address        
    end

    with_attr error_message("the current state does not allow modifications"):
        assert form.status = STATUS_OPEN
    end

    with_attr error_message("the number of questions must be greater than 0"):
        assert_le(0, dquestions_len)
    end

    with_attr error_message("Secret incorrect"):
        assert form.secret_hash = secret_hash
    end

    _add_questions(id_form, dquestions_len, dquestions)

    if status_open == 0:
        _change_status_ready_form(id_form, name, secret_hash)
    end

    FormCreated.emit(id_form)
    return (id_form)
end

@external
func forms_change_status_ready{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form : felt
) -> ():

    let (count) = forms_count.read()
    with_attr error_message("Form not found"):
        assert_in_range(id_form, 0, count)
    end

    let (form: Form) = forms.read(id_form)
    
    let (caller_address) = get_caller_address()
    with_attr error_message("Only the owner can modify"):
        assert form.created_at = caller_address        
    end

    with_attr error_message("the current state does not allow modifications"):
        assert form.status = STATUS_OPEN
    end

    _change_status_ready_form(id_form, form.name, form.secret_hash)
    return ()
end

@external
func send_answer{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form: felt, nickname: felt, answers_len: felt, answers: felt*
) -> ():
    alloc_locals

    let (count) = forms_count.read()
    with_attr error_message("Form not found"):
        assert_in_range(id_form, 0, count)
    end

    let (form: Form) = forms.read(id_form)
    
    with_attr error_message("the current state does not allow modifications"):
        assert form.status = STATUS_READY
    end

    let (count_question) = questions_count.read(id_form)
    with_attr error_message("Length of answers must be equal to the number of questions"):
        assert answers_len = count_question
    end

    let (caller_address) = get_caller_address()
    let (bool) = check_users_form.read(caller_address, id_form)
    with_attr error_message("You have already answered this form"):
        assert bool = FALSE
    end

    _recurse_add_answers(id_form, count_question, answers, 0, caller_address)
    check_users_form.write(caller_address, id_form, TRUE)
    nickname_users_form.write(caller_address, id_form, nickname)
    let (count_users) = count_users_form.read(id_form)
    users_form.write(id_form, count_users, caller_address)
    count_users_form.write(id_form, count_users + 1)

    return ()
end

@external
func close_forms{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form: felt,
    secret: felt
) -> ():
    alloc_locals

    let (count) = forms_count.read()
    with_attr error_message("Form not found"):
        assert_in_range(id_form, 0, count)
    end

    let (form: Form) = forms.read(id_form)
    
    with_attr error_message("the current state does not allow modifications"):
        assert form.status = STATUS_READY
    end

    let (hash) = hash2{hash_ptr=pedersen_ptr}(secret, 0)
    with_attr error_message("Secret incorrect"):
        assert hash = form.secret_hash
    end

    let (count_users) = count_users_form.read(id_form)
    let (count_question) = questions_count.read(id_form)
    _close_forms(id_form, count_users, count_question, secret)
    _change_status_close_form(id_form, form.name, form.secret_hash, secret)

    return ()
end

func _close_forms{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form: felt,
    count_users: felt,
    count_question: felt, 
    secret: felt
) -> ():
    alloc_locals
    if count_users == 0:
        return ()
    end

    let (user) = users_form.read(id_form, count_users - 1)
    let (point) = _calculate_score(id_form, count_question, 0, user, secret)
    points_users_form.write(user, id_form, point)
    _close_forms(id_form, count_users - 1, count_question, secret)
    return ()
end

func _calculate_score{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form: felt, 
    count_answer: felt, 
    idx: felt, 
    caller_address: felt,
    secret: felt
) -> (points: felt):
    alloc_locals
    if count_answer == 0:
        return (0)
    end

    # correct answer -> question.option_correct_hash
    let (question: Question) = questions.read(id_form, idx)

    # user response
    let (answer_user_id) = answer_users_form.read(caller_address, id_form, idx)
    let (question: Question) = questions.read(id_form, idx)
    let (answer_user) = _get_answer_for_id(question, answer_user_id)

    # generate the hash to the user response
    let (answer_user_hash) = hash2{hash_ptr=pedersen_ptr}(answer_user, secret)
    local t
    if answer_user_hash == question.option_correct_hash:
        t = 5
    else:
        t = 0
    end
    let (local total) = _calculate_score(id_form, count_answer - 1, idx + 1, caller_address, secret)
    let res = t + total
    return (res)
end

#
# Internal
#

func _create_form{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    name: felt,
    secret_hash: felt
) -> (id_form : felt):

    let (id_form) = forms_count.read()
    let (caller_address) = get_caller_address()
    forms.write(id_form, Form(id_form, name, caller_address, STATUS_OPEN, secret_hash, 0))
    forms_count.write(id_form + 1)
    return (id_form)
end

func _change_status_ready_form{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    id_form: felt, 
    name: felt,
    secret_hash: felt
) -> ():
    let (caller_address) = get_caller_address()
    forms.write(id_form, Form(id_form, name, caller_address, STATUS_READY, secret_hash, 0))
    return ()
end

func  _change_status_close_form{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
    id_form: felt, 
    name: felt,
    secret_hash: felt,
    secret: felt
) -> ():
    let (caller_address) = get_caller_address()
    forms.write(id_form, Form(id_form, name, caller_address, STATUS_CLOSED, secret_hash, secret))
    return ()
end

func _add_questions{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form : felt,
    dquestions_len: felt,
    dquestions : Question*
) -> ():
    alloc_locals

    let count_question = 0
    _add_a_questions(id_form, count_question, dquestions_len, dquestions)
    questions_count.write(id_form, count_question + dquestions_len)
    return ()
end

func _add_count_user_forms{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> ():
    let (caller_address: felt) = get_caller_address()
    let (count: felt) = count_forms_by_user.read(caller_address)
    count_forms_by_user.write(caller_address, count + 1)
    return ()
end

func _recurse_my_forms{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    user_address: felt,
    index: felt,
    len: felt,
    arr: Form*,
    idx: felt
) -> ():
    if index == len:
        return ()
    end

    let (form: Form) = forms.read(index)
    # If the form is created by me, I save it in the array.
    if  form.created_at == user_address:
        assert arr[idx] = Form(form.id, form.name, form.created_at, form.status, form.secret_hash, form.secret)
        _recurse_my_forms(user_address, index + 1, len, arr, idx + 1)
        return ()
    else:
        _recurse_my_forms(user_address, index + 1, len , arr, idx)
        return ()
    end
end

func _recurse_view_question{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr
}(id_form : felt, len : felt, arr : Question*, idx : felt) -> ():
    if idx == len:
        return ()
    end

    let (record : Question) = questions.read(id_form, idx)
    assert arr[idx] = Question(record.description, record.optionA, record.optionB, record.optionC, record.optionD, record.option_correct_hash)

    _recurse_view_question(id_form, len, arr, idx + 1)
    return ()
end

func _recurse_view_correct_form_answers{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr
}(id_form : felt, len : felt, arr : felt*, idx : felt) -> ():
    if idx == len:
        return ()
    end

    let (question: Question) = questions.read(id_form, idx)
    #estaria bueno una vez cerrado retornar un array con las posiciones de las respuestas correctas
    assert arr[idx] = question.option_correct_hash

    _recurse_view_correct_form_answers(id_form, len, arr, idx + 1)
    return ()
end

func _recurse_view_users_form_answers{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr
}(id_form : felt, len : felt, arr : felt*, idx : felt, caller_address: felt) -> ():
    if idx == len:
        return ()
    end

    let (option) = answer_users_form.read(caller_address, id_form, idx)
    assert arr[idx] = option

    _recurse_view_users_form_answers(id_form, len, arr, idx + 1, caller_address)
    return ()
end

func _recurse_view_question_dto{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr
}(id_form : felt, len : felt, arr : Question*, idx : felt) -> ():
    if idx == len:
        return ()
    end

    let (record : Question) = questions.read(id_form, idx)
    assert arr[idx] = Question(record.description, record.optionA, record.optionB, record.optionC, record.optionD, record.option_correct_hash)

    _recurse_view_question_dto(id_form, len, arr, idx + 1)
    return ()
end


func _recurse_view_answers_records{
    syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr
}(id_form : felt, len : felt, arr : Row*, idx : felt) -> ():
    if idx == len:
        return ()
    end

    let (user: felt) = users_form.read(id_form, idx)
    let (point) = points_users_form.read(user, id_form)
    let (nickname) = nickname_users_form.read(user, id_form)
    let (form: Form) = forms.read(id_form)
    assert arr[idx] = Row(id_form, form.name, form.status ,user, nickname, point)

    _recurse_view_answers_records(id_form, len, arr, idx + 1)
    return ()
end

func _recurse_add_answers{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form : felt, len : felt, arr : felt*, idx : felt, caller_address: felt
) -> ():
    alloc_locals
    if len == 0:
        return ()
    end

    tempvar answer_user : felt
    answer_user = cast([arr], felt)
    
    # 0 >= answer <= 3
    with_attr error_message("The option must be between 0 and 3"):
        assert_in_range(answer_user, 0, 4)
    end
    
    answer_users_form.write(caller_address, id_form, idx, answer_user)

    _recurse_add_answers(id_form, len - 1, arr + 1, idx + 1, caller_address)
    return ()
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

func _add_a_questions{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    id_form : felt,
    id_question : felt,
    dquestions_len: felt,
    dquestions : Question*
) -> ():
    if dquestions_len == 0:
        return ()
    end

    let description = [dquestions].description
    let optionA = [dquestions].optionA
    let optionB = [dquestions].optionB
    let optionC = [dquestions].optionC
    let optionD = [dquestions].optionD
    let option_correct_hash = [dquestions].option_correct_hash
    
    questions.write(
        id_form,
        id_question,
        Question(
        description,
        optionA,
        optionB,
        optionC,
        optionD,
        option_correct_hash
        )
    )

    _add_a_questions(id_form, id_question + 1, dquestions_len - 1, dquestions + Question.SIZE)
    return ()
end

func _recurse_my_score_forms_completed{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    user_address: felt,
    index: felt,
    len: felt,
    records: Row*,
    idx: felt
) -> ():
    if len == 0:
        return()
    end

    let (bool) = check_users_form.read(user_address, index)
    if bool == TRUE:
        let (point) = points_users_form.read(user_address, index)
        let (nickname) = nickname_users_form.read(user_address, index)
        let (form: Form) = forms.read(index)
        assert records[idx] = Row(index, form.name, form.status ,user_address, nickname, point)
        _recurse_my_score_forms_completed(user_address, index + 1, len - 1, records, idx + 1)
        return()
    else:
        _recurse_my_score_forms_completed(user_address, index + 1, len - 1, records, idx)
        return()
    end
end

func _recurse_count_my_score_forms_completed{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    user_address: felt,
    index: felt,
    len: felt,
    records: Row*
) -> (len: felt):
    alloc_locals
    if len == 0:
        return(0)
    end

    let (bool) = check_users_form.read(user_address, index)
    local t
    if bool == TRUE:
        t = 1
    else:
        t = 0
    end
    let (local total) = _recurse_count_my_score_forms_completed(user_address, index + 1, len - 1, records)
    let res = t + total
    return (res)
end