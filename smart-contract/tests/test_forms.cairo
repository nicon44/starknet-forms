%lang starknet

from src.common.utils import Question, Form, Row

from src.forms import STATUS_OPEN
from src.forms import STATUS_READY
from src.forms import STATUS_CLOSED

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.bool import TRUE, FALSE
from starkware.cairo.common.alloc import alloc
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.hash import hash2

from src.interfaces.IForm import IForm

@external
func test_create_forms{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():
    alloc_locals
    
    local contract_address : felt
    %{ ids.contract_address = deploy_contract("./src/forms.cairo", []).contract_address %}

    let secret = 'starknet'
    let (secret_hash) = hash2{hash_ptr=pedersen_ptr}(secret, 0)
    let (option_correct_hash) = hash2{hash_ptr=pedersen_ptr}(secret, 'celeste')
    let (local array: Question*) = alloc() 
    assert array[0] = Question('El cielo es?', 'rojo', 'gris', 'celeste', 'blanco', option_correct_hash)
    let (id_form) = IForm.create_form(
        contract_address=contract_address,
        name='Create Form',
        dquestions_len=1, 
        dquestions=array,
        status_open=1,
        secret_hash=secret_hash
    )

    let (form: Form) = IForm.view_form(
        contract_address=contract_address,
        id_form=id_form
    )

    assert form.name = 'Create Form'
    assert form.status = STATUS_OPEN
    assert form.secret_hash = secret_hash
    assert form.secret = 0

    let (form_count) = IForm.view_form_count(
        contract_address=contract_address)
    assert form_count = 1

    let (question: Question) = IForm.view_question(
        contract_address=contract_address,
        id_form=id_form,
        id_question=0
    )
    assert question.description = 'El cielo es?'
    assert question.optionA = 'rojo'
    assert question.optionB = 'gris'
    assert question.optionC = 'celeste'
    assert question.optionD = 'blanco'
    assert question.option_correct_hash = option_correct_hash

    let (question_count) = IForm.view_question_count(
        contract_address=contract_address,
        id_form=id_form)
    assert question_count = 1
    
    return ()
end

@external
func test_updated_form{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():

    alloc_locals
    let (contract_address) = test_integration.deploy_contract()
    let secret = 'starknet'
    let (secret_hash) = hash2{hash_ptr=pedersen_ptr}(secret, 0)
    let (local array: Question*) = alloc() 
    assert array[0] = Question('capital de Arg?', 'Jujuy', 'Bs As', 'Sanmi', 'La Plata', 2)
    assert array[1] = Question('capital de Brasil?', 'Rio', 'Brasilia', 'Belo', 'Manaos', 2)
    let (id_form) = IForm.updated_form(
        contract_address=contract_address,
        id_form=0,
        name='Updated Form',
        dquestions_len=2, 
        dquestions=array,
        status_open=0,
        secret_hash=secret_hash
    )

    assert id_form = 0
    
    let (form: Form) = IForm.view_form(
        contract_address=contract_address,
        id_form=id_form
    )

    let (form_count) = IForm.view_form_count(
        contract_address=contract_address)
    assert form_count = 1

    assert form.name = 'Updated Form'
    assert form.status = STATUS_READY
    assert form.secret_hash = secret_hash
    assert form.secret = 0

    let (question: Question) = IForm.view_question(
        contract_address=contract_address,
        id_form=id_form,
        id_question=0
    )
    assert question.description = 'capital de Arg?'
    assert question.optionA = 'Jujuy'
    assert question.optionB = 'Bs As'
    assert question.optionC = 'Sanmi'
    assert question.optionD = 'La Plata'
    assert question.option_correct_hash = 2

    let (question1: Question) = IForm.view_question(
        contract_address=contract_address,
        id_form=id_form,
        id_question=1
    )
    assert question1.description = 'capital de Brasil?'
    assert question1.optionA = 'Rio'
    assert question1.optionB = 'Brasilia'
    assert question1.optionC = 'Belo'
    assert question1.optionD = 'Manaos'
    assert question1.option_correct_hash = 2

    let (question_count) = IForm.view_question_count(
        contract_address=contract_address,
        id_form=id_form)
    assert question_count = 2

    return ()
end

@external 
func test_forms_change_status_ready{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():

    alloc_locals
    let (contract_address) = test_integration.deploy_contract()
    let (form: Form) = IForm.view_form(
        contract_address=contract_address,
        id_form=0
    )

    assert form.status = STATUS_OPEN

    IForm.forms_change_status_ready(
        contract_address=contract_address,
        id_form=0
    )

    let (form1: Form) = IForm.view_form(
        contract_address=contract_address,
        id_form=0
    )

    assert form1.status = STATUS_READY

    return()

end

@external 
func test_send_answer{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():

    alloc_locals
    let (contract_address) = test_integration.deploy_contract()
    let (form: Form) = IForm.view_form(
        contract_address=contract_address,
        id_form=0
    )
    IForm.forms_change_status_ready(
        contract_address=contract_address,
        id_form=0
    )

    let (local array : felt*) = alloc()
    assert array[0] = 2

    IForm.send_answer(
        contract_address=contract_address,
        id_form=0,
        nickname='Juan',
        answers_len=1,
        answers=array
    )
    
    let (count) = IForm.view_users_form_count(
        contract_address=contract_address,
        id_form=0
    )
    assert count = 1
    
    return()

end

@external 
func test_close_forms{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}():

    alloc_locals
    let (contract_address) = test_integration.deploy_contract()
    let (form: Form) = IForm.view_form(
        contract_address=contract_address,
        id_form=0
    )
    IForm.forms_change_status_ready(
        contract_address=contract_address,
        id_form=0
    )

    let (local array : felt*) = alloc()
    assert array[0] = 2

    IForm.send_answer(
        contract_address=contract_address,
        id_form=0,
        nickname='Juan',
        answers_len=1,
        answers=array
    )
    
    IForm.close_forms(
        contract_address=contract_address,
        id_form=0,
        secret='starknet'
    )

    let (records_len : felt, records : Row*) = IForm.view_score_form(
        contract_address=contract_address,
        id_form=0
    )

    assert records[0].score = 5
    
    return()

end
# --------------------------
# INTEGRATION TEST FUNCTIONS
# --------------------------

namespace test_integration:
    func deploy_contract{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}() -> (contract_address : felt):
        alloc_locals
        local contract_address : felt
        # We deploy contract and put its address into a local variable. Second argument is calldata array
        %{ ids.contract_address = deploy_contract("./src/forms.cairo", []).contract_address %}

        let secret = 'starknet'
        let (secret_hash) = hash2{hash_ptr=pedersen_ptr}(secret, 0)
        let (option_correct_hash) = hash2{hash_ptr=pedersen_ptr}('celeste', secret)
        let (local array: Question*) = alloc() 
        assert array[0] = Question('El cielo es?', 'rojo', 'gris', 'celeste', 'blanco', option_correct_hash)
        let (id_form) = IForm.create_form(
            contract_address=contract_address,
            name='Create Form',
            dquestions_len=1, 
            dquestions=array,
            status_open=1,
            secret_hash=secret_hash
        )
        return (contract_address)
    end
end