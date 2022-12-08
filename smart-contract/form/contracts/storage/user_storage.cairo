%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin
from starkware.cairo.common.uint256 import Uint256


// list of users who completed the form
@storage_var
func UserStorage_completed_form_list(id_form: felt, id_user: felt) -> (user: felt) {
}

// amount of users in form
@storage_var
func UserStorage_in_form_count(id_form: felt) -> (count_users: felt) {
}

// amount of forms you create
@storage_var
func UserStorage_created_forms_count(user_address: felt) -> (count_forms: felt) {
}

// users who completed the form / bool
@storage_var
func UserStorage_check_form_bool(user_address: felt, id_form: felt) -> (bool: felt) {
}

// users who completed the form / nickname
@storage_var
func UserStorage_nickname_form_bool(user_address: felt, id_form: felt) -> (nickname: felt) {
}

// responses from a user for a form
@storage_var
func UserStorage_answer_form_list(user_address: felt, id_form: felt, id_question: felt) -> (answer: Uint256) {
}

namespace UserStorage{

    //
    // Reads
    //

    func completed_form_list_read{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(id_form: felt, count_user: felt) -> (user: felt) {
        let (user,) = UserStorage_completed_form_list.read(id_form, count_user);
        return (user,);
    }

    func in_form_count_read{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(id_form: felt) -> (count_users: felt) {
        let (count_users) = UserStorage_in_form_count.read(id_form);
        return (count_users,);
    }

    func created_forms_count_read{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(user_address: felt) -> (count_forms: felt) {
        let (count_forms,) = UserStorage_created_forms_count.read(user_address);
        return (count_forms,);
    }

    func check_form_bool_read{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(user_address: felt, id_form: felt) -> (bool: felt) {
        let (bool,) = UserStorage_check_form_bool.read(user_address, id_form);
        return (bool,);
    }

    func nickname_form_bool_read{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(user_address: felt, id_form: felt) -> (nickname: felt) {
        let (nickname,) = UserStorage_nickname_form_bool.read(user_address, id_form);
        return (nickname,);
    }

    func answer_form_list_read{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(user_address: felt, id_form: felt, id_question: felt) -> (answer: Uint256) {
        let (answer,) = UserStorage_answer_form_list.read(user_address, id_form, id_question);
        return (answer,);
    }

    //
    // Writes
    //

    func completed_form_list_write{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(id_form: felt, count_user: felt, user: felt) {
        UserStorage_completed_form_list.write(id_form, count_user, user);
        return();
    }

    func in_form_count_write{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(id_form: felt, count_users: felt) {
        UserStorage_in_form_count.write(id_form, count_users);
        return();
    }

    func created_forms_count_write{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(user_address: felt, count_forms: felt) {
        UserStorage_created_forms_count.write(user_address, count_forms);
        return();
    }

    func check_form_bool_write{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(user_address: felt, id_form: felt, bool: felt) {
        UserStorage_check_form_bool.write(user_address, id_form, bool);
        return();
    }

    func nickname_form_bool_write{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(user_address: felt, id_form: felt, nickname: felt) {
        UserStorage_nickname_form_bool.write(user_address, id_form, nickname);
        return();
    }

    func answer_form_list_write{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(user_address: felt, id_form: felt, id_question: felt, answer: Uint256) {
        UserStorage_answer_form_list.write(user_address, id_form, id_question, answer);
        return();
    }
}