import { useQuery, useApolloClient } from "@apollo/client"
import Persons from "./components/Persons"
import PersonForm from "./components/CreatePerson"
import { ALL_PERSONS } from "./queries"
import { useEffect, useState } from "react"
import PhoneForm from "./components/PhoneForm"
import LoginForm from "./components/LoginForm"

const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null
  }

  return (
    <div style={{color: 'red'}}>
      {errorMessage}
    </div>
  )
}

const App = () => {
  const [errorMessage, setErrorMessage] = useState(null)
  const [token, setToken] = useState(null)
    
  const result = useQuery(ALL_PERSONS)
  const client = useApolloClient()
  
  if (result.loading) {
    return <div>loading...</div>
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  if (!token) {
    return (
      <div>
        <Notify errorMessage={errorMessage} />
        <LoginForm 
          setToken={setToken}
          setError={notify}
          />
      </div>
    )
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <Notify errorMessage={errorMessage} />
      <button type="button" onClick={handleLogout}>logout</button>
      <Persons persons={result.data.allPersons} />
      <PersonForm setError={notify}/>
      <PhoneForm setError={notify}/>
    </div>
  )

}

export default App