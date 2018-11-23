import * as React from 'react';
import Modal from 'react-responsive-modal';
import * as Webcam from "react-webcam";
import './App.css';
import ItemList from './components/ItemList';
import MemeDetail from './components/MemeDetail';
import lewisBillLogo from './lewisBillLogo.png';


interface IState {
	authenticated: boolean,
	billProduced: any[],
	currentItem: any,
	edit: boolean,
	height: any,
	items: any[],
	open: boolean,
	predictionResult: any,
	refCamera: any
	uploadFileList: any,
	warning: any,
	width: any,
}

class App extends React.Component<{}, IState> {
	constructor(props: any) {
        super(props)
        this.state = {
			authenticated: false,
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
			height: 0,
			items: [],
			open: false,
			predictionResult: null,
			refCamera: React.createRef(),
			uploadFileList: null,
			warning: '',
			width: 0,
		}     	
		this.selectNewItems = this.selectNewItems.bind(this)
		this.fetchItems = this.fetchItems.bind(this)
		this.handleFileUpload = this.handleFileUpload.bind(this)
		this.uploadItem = this.uploadItem.bind(this)
		this.clearBill = this.clearBill.bind(this)
		this.authenticate = this.authenticate.bind(this)
		this.getFaceRecognitionResult = this.getFaceRecognitionResult.bind(this)
		this.updateWindowDimensions = this.updateWindowDimensions.bind(this)
		this.fetchItems("")
	}

	public render() {
		const { open, edit } = this.state;
		window.addEventListener('resize', this.updateWindowDimensions);
		
		return (
		<div>
			<div className="header-wrapper">
				<div className="container header">
					{edit? 
					this.state.width>950?
					null
					:
					<div className="btn btn-primary btn-action extra-adding2" onClick={this.toggleEdit}>Cancel</div>
						:
					this.state.width>950?
					null
					:
					<div className="btn btn-primary btn-action extra-adding2" onClick={this.toggleEdit}>Edit</div>
					}
					<img src={lewisBillLogo} height='40'/>
					&nbsp; Lewis's Billing Helper! &nbsp;
					{edit? 
					this.state.width>950?
					<div className="btn btn-primary btn-action btn-add extra-adding" onClick={this.toggleEdit}>Cancel Edit</div>
					:
					null
						:
					this.state.width>950?
					<div className="btn btn-primary btn-action btn-add extra-adding" onClick={this.toggleEdit}>Edit List</div>
					:
					null
					}
					{this.state.width>950?
					<div className="btn btn-primary btn-action btn-add" onClick={this.onOpenModal}>Add Item</div>
					:
					<div className="btn btn-primary btn-action btn-add" onClick={this.onOpenModal}>Add</div>
					}
				</div>
			</div>
			{(!this.state.authenticated) ?
			<Modal open={!this.state.authenticated} onClose={this.authenticate} closeOnOverlayClick={false} showCloseIcon={false} center={true}>
				<Webcam
					style={{width:'90%', height:'90%'}}
					screenshotFormat="image/jpeg"
					ref={this.state.refCamera}
				/>
				<div className="row nav-row">
					<div className="btn btn-primary bottom-button" onClick={this.authenticate}>Login</div>
				</div>
			</Modal> 
			: 
			<div>
				{this.state.width>950? 
				<div className="container">
					{this.state.width>950?
						<div className="row">
							<div className="col-7">
								<MemeDetail currentItem={this.state.currentItem} selectNewItems={this.selectNewItems} clearBill={this.clearBill} billProduced={this.state.billProduced} />
							</div>
							<div className="col-5">
								<ItemList billProduced={this.state.billProduced} edit={this.state.edit} items={this.state.items} selectNewItems={this.selectNewItems} searchByName={this.fetchItems}/>
							</div>
						</div>
					:
						<div className="row center">
							<div className="col-25 center">
								<ItemList billProduced={this.state.billProduced} edit={this.state.edit} items={this.state.items} selectNewItems={this.selectNewItems} searchByName={this.fetchItems}/>
							</div>
						</div>
					}
				</div>
				:
				<div className="container pad-remover">
					{this.state.width>950?
						<div className="row">
							<div className="col-7">
								<MemeDetail currentItem={this.state.currentItem} selectNewItems={this.selectNewItems} clearBill={this.clearBill} billProduced={this.state.billProduced} />
							</div>
							<div className="col-5">
								<ItemList billProduced={this.state.billProduced} edit={this.state.edit} items={this.state.items} selectNewItems={this.selectNewItems} searchByName={this.fetchItems}/>
							</div>
						</div>
					:
						<div className="row center">
							<div className="col-25 center">
								<ItemList billProduced={this.state.billProduced} edit={this.state.edit} items={this.state.items} selectNewItems={this.selectNewItems} searchByName={this.fetchItems}/>
							</div>
						</div>
					}
				
				</div>
				}
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
					<small className="form-text text-muted text-warning">{this.state.warning}</small>
				</div>

				<button type="button" className="btn" onClick={this.uploadItem}>Add Item!</button>
			</form>
		</Modal></div>
			}
		</div>
		);
	}
	private updateWindowDimensions() {
		this.setState({ width: window.innerWidth, height: window.innerHeight });
	  }
	// Call custom vision model
private getFaceRecognitionResult(image: string) {
	const url = "https://southcentralus.api.cognitive.microsoft.com/customvision/v2.0/Prediction/1f3378e0-8e35-43d1-8d15-866469694af6/image?iterationId=503c9065-d287-4488-b443-02d720f024ed"
	if (image === null) {
		return;
	}
	const base64 = require('base64-js');
	const base64content = image.split(";")[1].split(",")[1]
	const byteArray = base64.toByteArray(base64content);
	fetch(url, {
		body: byteArray,
		headers: {
			'Content-Type': 'application/octet-stream',
			'Prediction-Key': '24ef251ab7e44dc7a89f3cdd85165233',
			'cache-control': 'no-cache',
		},
		method: 'POST'
	})
		.then((response: any) => {
			if (response.ok) {
				response.json().then((json: any) => {
					this.setState({predictionResult: json.predictions[0] })
					if (this.state.predictionResult.probability > 0.7) {
						this.setState({authenticated: true})
					} else {
						this.setState({authenticated: false})
						
					}
				})
			} else {
				response.json().then((json: any) => {
					console.log(json.predictions[0])
				})
			}
		})
}
	private authenticate() { 
		const screenshot = this.state.refCamera.current.getScreenshot();
		this.getFaceRecognitionResult(screenshot);
	}
	private clearBill = () => {
		this.state.billProduced.splice(0,this.state.billProduced.length)
		// location.reload()
                this.forceUpdate()
    }
	private toggleEdit = () => {
		this.setState({ edit: !this.state.edit });
	  };
	
	// Modal open
	private onOpenModal = () => {
		this.setState({ open: true });
	  };
	
	// Modal close
	private onCloseModal = () => {
		this.setState({ open: false, warning:'' });
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
	private uploadItem() {
		const itemName = document.getElementById("item-name-input") as HTMLInputElement
		const itemPrice = document.getElementById("item-price-input") as HTMLInputElement
		const imageFile = this.state.uploadFileList!==null?this.state.uploadFileList[0]:null
	
		if (itemName === null || itemPrice === null || imageFile === null) {
			this.setState({warning:'Make sure all fields are filled!'})
		} else {
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
}

export default App;
