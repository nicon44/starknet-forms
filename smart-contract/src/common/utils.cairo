struct Id_IPFS:
    member high: felt
    member low: felt
end

struct Form:
    member id: felt
    member name: felt
    member created_at: felt
    member status: felt
    member secret_hash: felt
    member secret: felt
end

struct Question:
    member description: Id_IPFS
    member optionA: Id_IPFS
    member optionB: Id_IPFS
    member optionC: Id_IPFS
    member optionD: Id_IPFS
    member option_correct: felt
end

struct Row:
    member id_form: felt
    member name: felt
    member status: felt
    member user: felt
    member nickname: felt
    member correct_count: felt
    member incorrect_count: felt
end

