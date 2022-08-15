# Starknet Forms

Welcome to Starknet Forms. This is a Google Forms like project built using blockchain technology.

Using this dApp you can create a multiple choice form / test and share it with other users who can complete it. Then, scores for each user are calculated in a descentralized and transparent way.

# Public server

We deployed this app in a public heroku server. It is available at https://starknet-forms-app.herokuapp.com/

# Demo

Demo video: https://www.youtube.com/watch?v=w4vnY9FFx_I

Contract: https://goerli.voyager.online/contract/0x03f81418d4249a81e89f5b85a21ed8eceb327450c8006a03981df5a905ad85ad

# Roles and form status

The forms can have 3 status:

  1. OPEN: It can be edited
  2. READY: It is not longer editable. Users can complete it.
  3. CLOSED: When a form is closed, results are calculated. It cannot be completed anymore.

We identified two roles: 

1. The owner, who can:
    * Create form
    * View forms
    * Edit form
    * Set form to ready
    * Close form (calculate scores)

2. The users, who can:
    * Complete form
    * View results on the forms they participated

# Use cases

  1. A school or university. Teachers would be the owners and students the users. Scores for each student are calculated in a transparent way.
  2. In the scope of Cairo / Starknet conferences or workshops. This tool can be usefull to set it up with related questions. Then, users with little experience will need to install a wallet, use a faucet and that would be good for them as a first step in the ecosystem.

# Technical details

The structure of a question is the following:

```
Question
  optionA
  optionB
  optionC
  optionD
  option_correct
```

The problem with this, is that we cannot store the correct option as plain text in the contract, as it is public.
That is why we introduced a secret combined with hashing.

The owner needs to introduce a secret password when creating a form.
This secret is saved hashed together with the form.

Note: For hashing, we are using the function hash.pedersen() available both in Cairo libraries (smart contract) and in starknet.js (frontend)

Apart from saving the hashed secret in the form, the question structure becomes:

```
struct Question:
    member description: felt
    member optionA: felt
    member optionB: felt
    member optionC: felt
    member optionD: felt
    member option_correct_hash: felt
end
```

Where 'option_correct_hash' is `hash.pedersen([correctOption, secret])`

Every time the owner wants to edit the form, he will need to introduce the correct secret again. Having the secret and the questions stored in the smart contract, the frontend can figure out the correct option, using hash.pedersen and comparing the result of every posible solution.

If the form is set to READY, users can complete it.

When the owner decides it, he can close the form. Once it is closed it cannot be completed anymore, and at this point, the smart contract calculates the score for every student. In order to do this, once again, the owner needs to introduce the correct secret.

The closing process: 

First, the introduced secret gets hashed and compared with the stored hash in the form. With this, we can assure the users that the owner did not change the secret.

Then, for every user, for every question, the user answer gets hashed together with the secret and compared to 'option_correct_hash' inside the stored question. If it is a match, the score for the user is updated, otherwise not.

# Next steps

1. We found a technical issue: the questions and answers in forms cannot be too long, because they are limited by the length of felt type in cairo. So, when you introduce a question/answer that is too long, the transaction fails.
One of the possibilities we thought to solve this is to save the hash of the questions / answers, instead of the entire string. We would need to add a database that stores the real questions and answers from where we can get them, and use the data returned from the smart contract to compare with what is in the database to make sure nothing was altered. This also would be good because we could use less storage, something that we know it is expensive in Starknet.

2. In my results page, we would like to show the user not only the score, but all his answers, compared to the correct answers.

3. We would like to improve the way the transactions are shown when they are not complete.
