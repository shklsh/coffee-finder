import React, { Component } from 'react';
import axios from 'axios';

class Coffeeshop extends Component {
    constructor() {
        super();
        this.state = {
            coffeeshops: []
        };

        const fetchCoffeeshops = () => {
            axios.get(`/coffeeshops.json`)
                .then(
                    results => this.setState(
                        {
                            coffeeshops: results.data
                        }
                    )
                )
        }
        fetchCoffeeshops();
    }

    render() {
        return (
            <div>
                <h2>Coffeeshops</h2>
                <input type="text" value={this.props.searchTerm} placeholder="search" />
                <CoffeeshopsList data={this.state.coffeeshops} searchTerm="" />
            </div>
        )
    }
}

class CoffeeshopsList extends Component {
    render() {
        let shops = this.props.data;
        if (this.props.searchTerm.length > 0) {
            shops = shops.filter(s => s.name.includes(this.props.searchTerm))
        }
        return (
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Name</th>
                        <th scope="col">Address</th>
                        <th scope="col">Contact Number</th>
                        <th scope="col">Website</th>
                        <th scope="col">Rating</th>
                        <th scope="col">Price</th>
                    </tr>
                </thead>

                <tbody>
                    {
                        shops.map(c =>
                            (<tr>
                                <td>{c.id}</td>
                                <td>{c.name}</td>
                                <td>{c.address}</td>
                                <td>{c.contact_number}</td>
                                <td>{c.website}</td>
                                <td>{c.rating}</td>
                                <td>{c.price}</td>
                            </tr>)
                        )
                    }
                </tbody>
            </table>
        )
    }
}

export default Coffeeshop;