import React, { Component, PropTypes } from 'react';
import List from './List';
 
class KanbanBoard extends Component {
	render(){
		return (
		<div className="app"> 
		<List taskCallbacks={this.props.taskCallbacks} id='todo' title="To Do" cards={
			this.props.cards.filter((card) => card.status === "todo")
		} />

		<List taskCallbacks={this.props.taskCallbacks} id='in-progress' title="In Progress" cards={
			this.props.cards.filter((card) => card.status === "in-progress")
		} />
 
		<List taskCallbacks={this.props.taskCallbacks} id='done' title='Done' cards={
			this.props.cards.filter((card) => card.status === "done")
		} />
 
		</div>
		);
	}
}

KanbanBoard.propTypes = {
	cards: PropTypes.arrayOf(PropTypes.object)
};

export default KanbanBoard;
