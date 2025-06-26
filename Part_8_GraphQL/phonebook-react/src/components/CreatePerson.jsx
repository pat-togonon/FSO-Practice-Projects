import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { ALL_PERSONS, CREATE_PERSON } from '../queries'
import { updateCache } from '../App'

const PersonForm = ({ setError }) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')

  const [ createPerson ] = useMutation(CREATE_PERSON, {
    onError: (error) => {
      const messages = error.graphQLErrors.map(e => e.message).join('\n')
      setError(messages)
    },
    update: (cache, response) => {
      updateCache(cache, { query: ALL_PERSONS }, response.data.addPerson)
    }
  })
  
  const handleSubmit = (event) => {
    event.preventDefault()
    console.log(name, phone, street, city)

    try {
    createPerson({ variables: { name, phone: phone.length > 0 ? phone : undefined, street, city }})

    setName('')
    setPhone('')
    setStreet('')
    setCity('')
    } catch (error) {
      console.log('error saving', error)
    }
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={handleSubmit}>
        <div>
          name <input value={name} onChange={({ target }) => setName(target.value)} />
        </div>
        <div>
          phone <input value={phone} onChange={({ target }) => setPhone(target.value)} />
        </div>
        <div>
          street <input value={street} onChange={({ target }) => setStreet(target.value)} />
        </div>
        <div>
          city <input value={city} onChange={({ target }) => setCity(target.value)} />
        </div>
        <button type="submit">add</button>
      </form>
    </div>
  )

}

export default PersonForm