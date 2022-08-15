struct Form:
    member id: felt
    member name: felt
    member created_at: felt
    member status: felt
    member secret_hash: felt
    member secret: felt
end

struct Question:
    member description: felt
    member optionA: felt
    member optionB: felt
    member optionC: felt
    member optionD: felt
    member option_correct_hash: felt
end

struct Row:
    member id_form: felt
    member name: felt
    member status: felt
    member user: felt
    member nickname: felt
    member score: felt
end