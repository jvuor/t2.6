import React from 'react'
import DBService from './services/persons.js'

const Nimi = ({nimi, number, remove}) => {
  return(
    <div>
      {nimi} {number} <button onClick={remove}>Poista</button>
    </div>
  )
}

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }
  return (
    <div className="error">
      {message}
    </div>
  )
}

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      persons: [],
      newName: '',
      newNumber: '',
      newSearch: '',
      error : null
    }
  }

  componentDidMount() {
    DBService
      .getAll()
      .then(persons =>{
        console.log(persons)
        this.setState({persons: persons})
      } )
  }

  handleName = (event) => {
    this.setState({newName: event.target.value})
  }

  handleNumber = (event) => {
    this.setState({newNumber: event.target.value})
  }

  handleSearch = (event) => {
    this.setState({newSearch: event.target.value})
  }

  removeName = (id) => {
    return () => {
      if (window.confirm(`Poistetaanko tämä henkilö?`)) {
        console.log('removename', id)
        DBService.remove(id)
        const newPersons = this.state.persons.filter(n => n.id !== id)
        this.setState({persons: newPersons})
        this.errorMsg(`Henkilö poistettu`)
      }
    }
  }

  Luettelo = ({persons, search}) => {
    var content = []
    console.log(search)
  
    for (var person of persons) {
      if (search === '' || person.name.includes(search)) {
        content.push(<Nimi key={person.id} nimi={person.name} number={person.number} remove={this.removeName(person.id)} />)
      }
    }
    return(content)
  }

  addName = (event) => {
    event.preventDefault()
    const nameObject = {
      name: this.state.newName,
      number: this.state.newNumber
    }
    var duplicate = false
    var duplicateNumber = false


    for (var person of this.state.persons) {
      if (person.name === nameObject.name) {
        duplicate = person.name
        if (person.number === this.state.newNumber)
        {
          duplicateNumber = true
        }
      }
    }

    if (!duplicate) {
      DBService
        .create(nameObject)
        .then(response => {
          this.setState({
            persons: this.state.persons.concat(response),
            newName: '',
            newNumber: ''
          })
        })
      this.errorMsg(`Henkilö ${nameObject.name} lisätty`)
    }
    else if (!duplicateNumber) {
      if (window.confirm(`Vaihdetaanko henkilön ${duplicate} numero?`)) {
        const oldData = this.state.persons.find(n => n.name === duplicate)
        const newData = {...oldData, number: this.state.newNumber}

        console.log(oldData, newData)

        DBService
          .changeNumber(newData.id, newData)
          .then(response => {
            this.setState({
              persons: this.state.persons.map(n => n.id !== newData.id ? n:response)
            })
          })
        
      }
      this.errorMsg('Henkilön numero muutettu')
    }
    else {
      this.setState({newNumber: '', newName: ''})
      this.errorMsg('Nimi ja numero ovat jo olemassa')
    }
  }

  errorMsg = (message) => {
    this.setState({error: message})
    setTimeout(() => {
      this.setState({error: null})
    }, 5000)
  }

  render() {
    return (
      <div>
        <Notification message={this.state.error} />
        <h2>Puhelinluettelo</h2>
        <form onSubmit={this.addName}>
          <div>
            nimi: <input value={this.state.newName} onChange={this.handleName} />
          </div>
          <div>
            numero: <input value={this.state.newNumber} onChange={this.handleNumber} />
          </div>
          <div>
            <button type="submit">lisää</button>
          </div>
        </form>
        <h2>Numerot</h2>
        <div>
          Hae: <input value={this.state.newSearch} onChange={this.handleSearch} />
        </div>
        <this.Luettelo persons={this.state.persons} search={this.state.newSearch}/>
      </div>
    )
  }
}

export default App