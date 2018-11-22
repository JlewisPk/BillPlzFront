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
}
export default class ItemList extends React.Component<IProps, IState> {
    constructor(props: any) {
        super(props)   
        this.state = {
            open: false,
            selectedItem: null,
        }
        this.searchByName = this.searchByName.bind(this)
    }
	public render() {
        const { open } = this.state;
		return (
			<div className="container meme-list-wrapper">
                <div className="row meme-list-heading">
                    <div className="input-group">
                        <input type="text" onKeyPress={this.handleKeyPress} id="search-tag-textbox" className="form-control" placeholder="Search By Tags" />
                        <div className="input-group-append">
                            <div className="btn" onClick={this.searchTagByVoice}><i className="fa fa-microphone" /></div>
                            <div className="btn btn-outline-secondary search-button" onClick = {this.searchByName}>Search</div>
                        </div>
                    </div>  
                </div>
                <div className="row meme-list-table">
                    <table className="table table-striped">
                        <tbody>
                            {this.createTable()}
                        </tbody>
                    </table>
                </div>


                
                <Modal open={open} onClose={this.onCloseModal}>
                    <form>
                        <div className="form-group">
                            <label>Meme Title</label>
                            <input type="text" className="form-control" id="meme-edit-title-input" placeholder="Enter Title"/>
                            <small className="form-text text-muted">You can edit any meme later</small>
                        </div>
                        <div className="form-group">
                            <label>Tag</label>
                            <input type="text" className="form-control" id="meme-edit-tag-input" placeholder="Enter Tag"/>
                            <small className="form-text text-muted">Tag is used for search</small>
                        </div>
                        <button type="button" className="btn" onClick={this.updateMeme}>Save</button>
                    </form>
                </Modal>
            </div>
		);
    }
    private searchTagByVoice() {
        const mediaConstraints = {
            audio: true
        }
        const onMediaSuccess = (stream: any) => {
            const mediaRecorder = new MediaStreamRecorder(stream);
            mediaRecorder.mimeType = 'audio/wav'; // check this line for audio/wav
            mediaRecorder.ondataavailable = (blob: any) => {
                // this.postAudio(blob);
                mediaRecorder.stop()
            }
            mediaRecorder.start(3000);
        }
    
        navigator.getUserMedia(mediaConstraints, onMediaSuccess, onMediaError)
    
        function onMediaError(e: any) {
            console.error('media error', e);
        }
    }
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
                    <div className="btn btn-primary btn-action" onClick={this.deleteMeme.bind(this, item.itemId)}>Delete </div>
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
        const textBox = document.getElementById("search-tag-textbox") as HTMLInputElement
        if (textBox === null) {
            return;
        }
        const tag = textBox.value 
        this.props.searchByName(tag)  
    }

    // Modal Open
    private onOpenModal = (item:any) => {
        this.setState({ open: true, selectedItem:item });
	  };
    
    // Modal Close
    private onCloseModal = () => {
		this.setState({ open: false });
    };
    private updateMeme(){
        const titleInput = document.getElementById("meme-edit-title-input") as HTMLInputElement
        const tagInput = document.getElementById("meme-edit-tag-input") as HTMLInputElement
    
        if (titleInput === null || tagInput === null) {
            return;
        }
        const currentItem = this.state.selectedItem;
        const url = "http://phase2apitest.azurewebsites.net/api/meme/" + currentItem.id
        const updatedItemName = titleInput.value
        const updatedPrice = tagInput.value
        fetch(url, {
            body: JSON.stringify({
				"height": currentItem.height,
				"itemCount": 1,
				"itemName": updatedItemName,
				"itemPrice": updatedPrice,
				"itemURL": currentItem.url,
				"uploaded": currentItem.uploaded,
				"width": currentItem.width
			  }),
            headers: {'cache-control': 'no-cache','Content-Type': 'application/json'},
            method: 'PUT'
        })
        .then((response : any) => {
            if (!response.ok) {
                // Error State
                alert(response.statusText + " " + url)
            } else {
                location.reload()
            }
        })
    }
    private deleteMeme(id: any) {
        const url = "http://phase2apitest.azurewebsites.net/api/meme/" + id
    
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