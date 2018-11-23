import MediaStreamRecorder from 'msr';
import * as React from "react";
import Modal from 'react-responsive-modal';

interface IProps {
    billProduced: any[],
    edit: boolean,
    items: any[],
    selectNewItems: any,
    searchByName: any,
}
interface IState {
	selectedItem: any,
    open: boolean,
    warning: any,
}
export default class ItemList extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props)   
        this.state = {
            open: false,
            selectedItem: {
				height: "700",
				itemCount: 1,
				itemId: 1,
				itemName: "Pork Belly",
				itemPrice: 28,
				itemURL: "https://billplzblob.blob.core.windows.net/itemimages/porkbelly.jpg",
                uploaded: "11/10/2018 10:09:52 PM",
				width: "700"
			  },
              warning: ''
        }
        this.searchByName = this.searchByName.bind(this)
        this.updateItem = this.updateItem.bind(this)
        this.searchTagByVoice = this.searchTagByVoice.bind(this) 
        // this.getAccessTokenForVoiceCognitive = this.getAccessTokenForVoiceCognitive.bind(this)
    }
	public render() {
        const { open } = this.state;
		return (
			<div className="container item-list-wrapper">
                <div className="row">
                    <div className="input-group">
                        <input type="text" onKeyPress={this.handleKeyPress} id="search-item-textbox" className="form-control" placeholder="Search By Item Name" />
                        <div className="input-group-append">
                            <div className="btn" onClick={this.searchTagByVoice}><i className="fa fa-microphone icon-color" /></div>
                            <div className="btn btn-outline-secondary search-button" onClick = {this.searchByName}>Search</div>
                        </div>
                    </div>  
                </div>
                <div className="row item-list-table">
                    <table className="table table-striped">
                        <tbody>
                            {this.createTable()}
                        </tbody>
                    </table>
                </div>


                
                <Modal open={open} onClose={this.onCloseModal}>
                    <form>
                        <div className="form-group">
                            <label>Item Name</label>
                            <input type="text" className="form-control" id="item-edit-name-input" placeholder="Enter New Item Name"/>
                            <small className="form-text text-muted">You can edit any item later</small>
                        </div>
                        <div className="form-group">
                            <label>Item Price</label>
                            <input type="text" className="form-control" id="item-edit-price-input" placeholder="Enter New Price"/>
                            <small className="form-text text-muted text-warning">{this.state.warning}</small>
                        </div>
                        <button type="button" className="btn" onClick={this.updateItem}>Save</button>
                    </form>
                </Modal>
            </div>
		);
    }
    
    private async searchTagByVoice() {
        const mediaConstraints = {
            audio: true,
            video:false
        }
        const onMediaSuccess = (stream: any) => {
            const mediaRecorder = new MediaStreamRecorder(stream);
            mediaRecorder.mimeType = 'audio/wav'; // check this line for audio/wav
            mediaRecorder.ondataavailable = (blob: any) => {
                let accessToken: any;
                fetch('https://westus.api.cognitive.microsoft.com/sts/v1.0/issueToken', {
                    headers: {
                        'Content-Length': '0',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Ocp-Apim-Subscription-Key': '821da687c4c146e69ee3e671077cf367'
                    },
                    method: 'POST'
                }).then(async(response: any) => {
                    const resToken = await response.text()
                    return resToken
                }).then(async (response: any) => {
                    accessToken = response
                }).catch((error: any) => {
                    console.log("Error", error)
                });
                // posting audio
                fetch('https://westus.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US', {
                    body: blob, // this is a .wav audio file    
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + accessToken,
                        'Content-Type': 'audio/wav;codec=audio/pcm; samplerate=16000',
                        'Ocp-Apim-Subscription-Key': '821da687c4c146e69ee3e671077cf367'
                    },    
                    method: 'POST'
                }).then((res: any) => {
                    console.log('res:  ', res)
                    return res.json()
                }).then((res: any) => {
                    console.log(res)
                    const textBox = document.getElementById("search-item-textbox") as HTMLInputElement
                    textBox.value = (res.DisplayText as string).slice(0, -1)
                }).catch((error: any) => {
                    console.log("Error", error)
                });
                mediaRecorder.stop()
            }
            mediaRecorder.start(3000);
        }
        
        function onMediaError(e: any) {
            console.error('media error', e);
        }

        navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
    }
    // private postAudio(blob: any) {
        
    // }
    private handleKeyPress = (event: any) => {
        if(event.key === 'Enter'){
          this.searchByName()
        }
      }
    // Construct table using meme list
	private createTable() {
        const table:any[] = []
        const itemList = this.props.items;
        if (itemList == null) {
            return table
        }

        for (let i = 0; i < itemList.length; i++) {
            const children = []
            const item = itemList[i]
            children.push(<td key={"itemId" + i}><img src={item.itemURL} style={{width:50, height:50}}/></td>)
            children.push(<td key={"itemName" + i}><div className="bill-row-item" >{item.itemName}</div></td>)
            children.push(<td key={"itemPrice" + i}><div className="bill-row-item" >$ {item.itemPrice}</div></td>)
            children.push(<td key={"itemButtons" + i}>
            {this.props.edit?
                <div className="row meme-done-button">
                    <div className="btn btn-primary btn-action" onClick={this.onOpenModal.bind(this,item)}>Edit </div>
                    <div className="btn btn-primary btn-action" onClick={this.deleteItem.bind(this, item.itemId)}>Delete </div>
                </div>
                :
                null
            }
            
        </td>)
            table.push(<tr key={i+""} className="item-row" id={i+""} onClick= {this.selectRow.bind(this, i)}>{children}</tr>)
        }
        return table
    }
    // Meme selection handler to display selected meme in details component
    private async selectRow(index: any) {
        const selectedItem = this.props.items[index]
        let addNew = true
        await this.props.billProduced.map((itemInBill, index2) => {
            if (itemInBill.itemName === selectedItem.itemName) {
                addNew = false
                this.props.billProduced[index2].itemCount +=1;
            }
        })
        console.log('1: ', this.props.billProduced)
        if (addNew) {
            this.props.billProduced.push(selectedItem)
            console.log('2: ', this.props.billProduced)
        }
        this.props.selectNewItems(this.props.billProduced)
    }

    // Search meme by tag
    private searchByName() {
        const textBox = document.getElementById("search-item-textbox") as HTMLInputElement
        if (textBox === null) {
            return;
        }
        const tag = textBox.value 
        this.props.searchByName(tag)  
    }

    // Modal Open
    private onOpenModal = (item:any) => {
        this.setState({ open: true, selectedItem:item },()=> {
            this.forceUpdate()
        });
	  };
    
    // Modal Close
    private onCloseModal = () => {
		this.setState({ open: false, warning:'' });
    };
    private updateItem(){
        const newItemName = document.getElementById("item-edit-name-input") as HTMLInputElement
        const newPriceName = document.getElementById("item-edit-price-input") as HTMLInputElement
    
        if (newItemName.value === '' || newPriceName.value === '') {
			this.setState({warning:'Make sure all fields are filled!'})
        } else {
            const url = "https://billplzapi.azurewebsites.net/api/items/" + this.state.selectedItem.itemId
            const jsonBody = {
                "height": this.state.selectedItem.height,
                "itemCount": 1,
                "itemId": this.state.selectedItem.itemId,
                "itemName": newItemName.value,
                "itemPrice": newPriceName.value,
                "itemURL": this.state.selectedItem.itemURL,
                "uploaded": this.state.selectedItem.uploaded,
                "width": this.state.selectedItem.width
            }
            fetch(url, {
                body: JSON.stringify(jsonBody),
                headers: {'cache-control': 'no-cache','Content-Type': 'application/json'},
                method: 'PUT'
            })
            .then(async (response : any) => {
                if (!response.ok) {
                    // Error State
                    alert(response.statusText + " " + url)
                } else {
                    location.reload()
                }
            })
        }
        
    }
    private deleteItem(id: any) {
        const url = "https://billplzapi.azurewebsites.net/api/items/" + id
    
        fetch(url, {
            method: 'DELETE'
        })
        .then((response : any) => {
            if (!response.ok) {
                // Error Response
                alert(response.statusText)
            }
            else {
                location.reload()
            }
        })
    }
}