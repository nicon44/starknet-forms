%lang starknet

from src.common.utils import Question, Form, Row

@contract_interface
namespace IForm:
    
    func view_form(
        id_form: felt
    ) -> (form: Form):
    end
    
    func view_count_forms_by_user(
        user_address: felt
    ) -> (res: felt):
    end
    
    func view_my_forms(
        user_address: felt
    ) -> (records_len: felt, records: Form*):
    end
    
    func view_form_count() -> (
        count : felt
    ):
    end
    
    func view_question(
        id_form : felt,
        id_question : felt
    ) -> (question: Question):
    end

    func view_questions(
        id_form : felt
    ) -> (records_len : felt, records : Question*):
    end
    
    func view_question_count(
        id_form : felt
    ) -> (question_count : felt):
    end
    
    func view_users_form_count(
        id_form : felt
    ) -> (count_user : felt):
    end
    
    func view_score_form(
        id_form : felt
    ) -> (records_len : felt, records : Row*):
    end
    
    func view_score_form_user(
        id_form : felt, user: felt
    ) -> (point: felt):
    end
    
    func view_correct_form_answers(
        id_form : felt
    ) -> (records_len : felt, records : felt*):
    end

    func view_users_form_answers(
        id_form : felt,
        user: felt
    ) -> (records_len : felt, records : felt*):
    end

    func view_my_score_forms_completed(
        user_address: felt
    ) -> (records_len: felt, records: Row*):
    end
    
    func create_form(
        name: felt,
        dquestions_len: felt,
        dquestions: Question*,
        status_open: felt,
        secret_hash: felt
    ) -> (id_form: felt):
    end

    func updated_form(
        id_form: felt,
        name: felt,
        dquestions_len: felt,
        dquestions: Question*,
        status_open: felt,
        secret_hash: felt
    ) -> (id_form: felt):
    end

    func forms_change_status_ready(
        id_form : felt
    ) -> ():
    end

    func send_answer(
        id_form: felt, nickname: felt, answers_len: felt, answers: felt*
    ) -> ():
    end
    
    func close_forms(
        id_form: felt,
        secret: felt
    ) -> ():
    end
end