%lang starknet

from starkware.cairo.common.cairo_builtins import HashBuiltin

from contracts.types.data_types import DataTypes

// forms list
@storage_var
func FormStorage_list(form_id: felt) -> (form: DataTypes.Form) {
}

// amount of forms
@storage_var
func FormStorage_count() -> (count: felt) {
}

namespace FormStorage {
    //
    // Reads
    //

    func list_read{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        form_id: felt
    ) -> (form: DataTypes.Form) {
        let (form) = FormStorage_list.read(form_id);
        return (form,);
    }

    func count_read{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}() -> (count: felt) {
        let (count) = FormStorage_count.read();
        return (count,);
    }

    //
    // Writes
    //

    func list_write{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        form_id: felt,
        form: DataTypes.Form
    ) {
        FormStorage_list.write(form_id, form);
        return ();
    }

    func count_write{syscall_ptr: felt*, pedersen_ptr: HashBuiltin*, range_check_ptr}(
        count: felt
    ) {
        FormStorage_count.write(count);
        return ();
    }
}