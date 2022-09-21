%lang starknet

from src.common.utils import Question, Form, Row, Id_IPFS

from src.forms import STATUS_OPEN
from src.forms import STATUS_READY
from src.forms import STATUS_CLOSED

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.bool import TRUE, FALSE
from starkware.cairo.common.alloc import alloc
from starkware.starknet.common.syscalls import get_caller_address
from starkware.cairo.common.hash import hash2

from src.interfaces.IForm import IForm
from src.forms import _get_index_option_correct
from src.forms import create_form
from src.forms import send_answer
from src.forms import close_forms
from src.forms import view_score_form_user
from src.forms import view_score_form

@external
func test_dale{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() {
    alloc_locals;

    // create form
    let (local array: Question*) = alloc();
    assert array[0] = Question(Id_IPFS(1111, 1111),
        Id_IPFS(2222, 2222),
        Id_IPFS(3333, 3333),
        Id_IPFS(4444, 4444),
        Id_IPFS(5555, 5555),
        0x598aad02f9d8481edd0b3618e4f6c3891348b983a3ebacd5cbb07f4e6acb2f7
        );

    assert array[1] = Question(Id_IPFS(1111, 1111),
        Id_IPFS(5555, 5555),
        Id_IPFS(2222, 2222),
        Id_IPFS(3333, 3333),
        Id_IPFS(4444, 4444),
        0x598aad02f9d8481edd0b3618e4f6c3891348b983a3ebacd5cbb07f4e6acb2f7
        );

    let (id_form) = create_form(
        'dale', 2, array, 0, 0x4f5d379eff1957f83228971f22814d7c44d37d020139552ec686cfd150c9ab
    );

    // send answer
    let (local array1: felt*) = alloc();
    assert array1[0] = 3;
    assert array1[1] = 0;
    send_answer(id_form, 1234, 2, array1);

    // close form
    close_forms(id_form, 'hola');

    // check
    let (user) = get_caller_address();
    let (point) = view_score_form_user(id_form, user);
    assert point = 2;

    let (records_len: felt, records: Row*) = view_score_form(id_form);
    assert records[0].correct_count = 2;
    assert records[0].incorrect_count = 0;

    // let secret = 'hola'
    // let (index) = _get_index_option_correct(array[0], secret)
    // assert index = 0

    return ();
}
