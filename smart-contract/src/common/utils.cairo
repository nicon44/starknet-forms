struct Id_IPFS {
    high: felt,
    low: felt,
}

struct Form {
    id: felt,
    name: felt,
    created_at: felt,
    status: felt,
    secret_hash: felt,
    secret: felt,
}

struct Question {
    description: Id_IPFS,
    optionA: Id_IPFS,
    optionB: Id_IPFS,
    optionC: Id_IPFS,
    optionD: Id_IPFS,
    option_correct: felt,
}

struct Row {
    id_form: felt,
    name: felt,
    status: felt,
    user: felt,
    nickname: felt,
    correct_count: felt,
    incorrect_count: felt,
}
