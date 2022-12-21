from starkware.cairo.common.uint256 import Uint256

namespace DataTypes {
    struct Form {
        id: felt,
        name: felt,
        created_at: felt,
        status: felt,
    }

    struct Row {
        user: felt,
        nickname: felt,
        answer_id: Uint256,
    }
}