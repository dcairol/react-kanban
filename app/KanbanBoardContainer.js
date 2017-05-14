'use strict';

import React, { Component, PropTypes } from 'react';
import { render } from 'react-dom';
import 'whatwg-fetch';
import KanbanBoard from './KanbanBoard';

const API_URL = 'http://kanbanapi.pro-react.com';
const API_HEADERS = {
	'Content-Type': 'application/json',
	Authorization: 'dcairol'
};

class KanbanBoardContainer extends Component {
	constructor(){
		super(...arguments);
		this.state = {
			cards: []
		};
	}

	apiCall(path){
		const URL = `${API_URL}/${path}`;
		return fetch(URL);
	}

	apiCallGet(path){
		return this.apiCall(path)
		.then(data => data.json());
	}

	componentDidMount(){
		return this.apiCallGet('cards')
		.then(cards => {
			this.setState({ cards });
		})
		.catch(err => console.error(err.message));
	}

	render(){
		return <KanbanBoard cards ={this.state.cards} />;
	}
}

export default KanbanBoardContainer;
