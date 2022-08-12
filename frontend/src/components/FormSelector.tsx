import { useState } from "react";

const FormSelector = (props: {onSubmit: (formId: number) => void}) => {

  const [formId, setFormId] = useState<string>('');

  const idChangeHandler = (event: any) => {
    setFormId(event.target.value);
  }

  const submit = () => {
    if (formId) {
      props.onSubmit(+formId);
    } else {
      alert('Insert a numeric value to continue')
    }
  }

  return <div>
      <label>Please insert the id of the form you want to access:</label><br />
      <input type="number" value={formId} onChange={idChangeHandler} />
      <button onClick={submit}>GO!</button>
    </div>
}

export default FormSelector;