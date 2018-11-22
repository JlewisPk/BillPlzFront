import * as React from 'react';
import Modal from 'react-responsive-modal';
import './App.css';
import ItemList from './components/ItemList';
import MemeDetail from './components/MemeDetail';
import PatrickLogo from './patrick-logo.png';


interface IState {
	billProduced: any[],
	currentItem: any,
	edit: boolean,
	items: any[],
	open: boolean,
	uploadFileList: any,
}

class App extends React.Component<{}, IState> {
	constructor(props: any) {
        super(props)
        this.state = {
			billProduced: [],
			currentItem: {
				"height": "700",
				"itemCount": 1,
				"itemId": 1,
				"itemName": "Pork Belly",
				"itemPrice": 28,
				"itemURL": "https://billplzblob.blob.core.windows.net/itemimages/porkbelly.jpg",
				"uploaded": "11/10/2018 10:09:52 PM",
				"width": "700"
			  },
			edit: false,
			items: [],
			open: false,
			uploadFileList: null
		}     	
		this.selectNewItems = this.selectNewItems.bind(this)
		this.fetchItems = this.fetchItems.bind(this)
		this.handleFileUpload = this.handleFileUpload.bind(this)
		this.uploadMeme = this.uploadMeme.bind(this)
		
		this.fetchItems("")
	}

	public render() {
		const { open, edit } = this.state;
		return (
		<div>
			<div className="header-wrapper">
				<div className="container header">
					<img src={PatrickLogo} height='40'/>&nbsp; Lewis's Billing Helper! &nbsp;
					{edit? 
					<div className="btn btn-primary btn-action btn-add extra-adding" onClick={this.toggleEdit}>Cancel Edit</div>
						:
					<div className="btn btn-primary btn-action btn-add extra-adding" onClick={this.toggleEdit}>Edit List</div>
					}
					<div className="btn btn-primary btn-action btn-add" onClick={this.onOpenModal}>Add Item</div>
				</div>
			</div>
			<div className="container">
				<div className="row">
					<div className="col-7">
						<MemeDetail currentItem={this.state.currentItem} selectNewItems={this.selectNewItems}  billProduced={this.state.billProduced} />
					</div>
					<div className="col-5">
						<ItemList billProduced={this.state.billProduced} edit={this.state.edit} items={this.state.items} selectNewItems={this.selectNewItems} searchByName={this.fetchItems}/>
					</div>
				</div>
			</div>
			<Modal open={open} onClose={this.onCloseModal}>
				<form>
					<div className="form-group">
						<label>Item Name</label>
						<input type="text" className="form-control" id="item-name-input" placeholder="Enter Item Name" />
						<small className="form-text text-muted">You can edit any item later</small>
						<small className="form-text text-muted">Item Name is used for search</small>
					</div>
					<div className="form-group">
						<label>Item Price</label>
						<input type="text" className="form-control" id="item-price-input" placeholder="Enter Price" />
						<small className="form-text text-muted">Item Price is used for bill calculation</small>
					</div>
					<div className="form-group">
						<label>Image</label>
						<input type="file" onChange={this.handleFileUpload} className="form-control-file" id="meme-image-input" />
					</div>

					<button type="button" className="btn" onClick={this.uploadMeme}>Add Item!</button>
				</form>
			</Modal>
		</div>
		);
	}

	// private methodNotImplemented() {
	// 	alert("Method not implemented")
	// }
	private toggleEdit = () => {
		this.setState({ edit: !this.state.edit });
	  };
	
	// Modal open
	private onOpenModal = () => {
		this.setState({ open: true });
	  };
	
	// Modal close
	private onCloseModal = () => {
		this.setState({ open: false });
	};
	
	// Change selected meme
	private selectNewItems(newItem: any) {
		this.setState({
			billProduced: newItem
		})
	}

	private fetchItems(itemName: any) {
		let url = "https://billplzapi.azurewebsites.net/api/items"
		if (itemName !== "") {
			url += "/itemName?itemName=" + itemName
		}
		fetch(url, {
			method: 'GET'
		})
		.then(res => res.json())
		.then(json => {
			let currentItem = json[0]
			if (currentItem === undefined) {
				currentItem = {
					"height": "",
					"itemCount": 0,
					"itemName": 'No matching ' + itemName + ' is not found D:',
					"itemPrice": 28,
					"itemURL": "",
					"uploaded": "",
					"width": ""
				  }
			}
			this.setState({
				currentItem,
				items: json
			})
		});
	}
	private handleFileUpload(fileList: any) {
		this.setState({
			uploadFileList: fileList.target.files
		})
	}
	private uploadMeme() {
		const itemName = document.getElementById("item-name-input") as HTMLInputElement
		const itemPrice = document.getElementById("item-price-input") as HTMLInputElement
		const imageFile = this.state.uploadFileList[0]
	
		if (itemName === null || itemPrice === null || imageFile === null) {
			return;
		}
	
		const ItemName = itemName.value
		const ItemPrice = itemPrice.value
		const url = "https://billplzapi.azurewebsites.net/api/items/upload"
	
		const formData = new FormData()
		formData.append("itemName", ItemName)
		formData.append("itemPrice", ItemPrice)
		formData.append("image", imageFile)
	
		fetch(url, {
			body: formData,
			headers: {'cache-control': 'no-cache'},
			method: 'POST'
		})
		.then((response : any) => {
			if (!response.ok) {
				// Error State
				alert(response.statusText)
			} else {
				location.reload()
			}
		})
	}
}

export default App;
