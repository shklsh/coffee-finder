import React, { Component } from 'react';
import MainPage from './components/MainPage';
import { Button, Input, Divider, message } from 'antd';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import 'antd/dist/antd.css';

class App extends Component {
  render() {
    return (
      <div className="App">
          <div classname="header">
            <h1 className="mb-4 fw-md" style={{color:"brown"}}>Coffee Finder</h1> 
            {/* <img src="/coffee_icon2.png" alt="image" />  */}
          </div>  
          <img src='https://media.istockphoto.com/photos/espresso-coffee-cup-with-beans-on-vintage-table-picture-id664313320?k=6&m=664313320&s=612x612&w=0&h=moC0a_8D-s62K72DceEnSFMx413HfTouZDzri7n7aA8=' className="image-wrapper-sm mb-2" alt="coffee" />            
          <MainPage />
      </div>
      
    );
  }
}

export default App;