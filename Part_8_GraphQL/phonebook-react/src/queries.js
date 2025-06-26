import { gql } from '@apollo/client'


const PERSON_DETAILS = gql `
  fragment PersonDetails on Person {
    name
    phone
    id
    address {
      street
      city
    }
  } 
`

export const ALL_PERSONS = gql `
  query {
    allPersons {
      ...PersonDetails 
    }
  }
  ${PERSON_DETAILS}
`
export const CREATE_PERSON = gql `
  mutation createPerson($name: String!, $street: String!, $city: String!, $phone: String) {
    addPerson(
      name: $name,
      street: $street,
      city: $city,
      phone: $phone 
    ) {
      name
      phone
      id
      address {
        street
        city
      }  
    }
  }
`
export const FIND_PERSON = gql `
  query findPersonByName($nameToSearch: String!) {
    findPerson(name: $nameToSearch) {
      ...PersonDetails
    }
  }
  ${PERSON_DETAILS}
`

export const EDIT_NUMBER = gql `
  mutation editNumberByName($name: String!, $phone: String!) {
    editNumber(name: $name, phone: $phone) {
      name
      phone
      address {
        street
        city
      }
      id
    } 
  }
`

export const LOGIN = gql `
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }

`

export const PERSON_ADDED = gql `
  subscription {
    personAdded {
      ...PersonDetails
    }
  }
  ${PERSON_DETAILS}
`