import * as React from "react";

interface IProps {
    billProduced: any[],
    clearBill: any,
    currentItem: any,
    selectNewItems: any,
}

interface IState {
    open: boolean
}

export default class MemeDetail extends React.Component<IProps, IState> {

    constructor(props: any) {
        super(props)   
        this.state = {
            open: false
        }
        // we do this since below method wants to use state(props? find out)
    }

	public render() {
        const billProduced = this.props.billProduced
        let total = 0;
        billProduced.map((i)=> {
            const subTotal = i.itemPrice * i.itemCount;
            total = total + subTotal
        })
		return (
			<div className="container meme-wrapper">
                <div style={{alignContent:'center', marginBottom:32}} className="row meme-heading">
                    <b style={{alignContent:'center'}}>Bill</b>
                    {/* <b>{billProduced[0]!==undefined?billProduced[0].itemName:null}</b>&nbsp; ({billProduced[0]!==undefined?billProduced[0].itemCount:null}) */}
                </div>
                
                <div className="row meme-list-table">
                    <table className="table table-striped">
                        <tbody>
                        {billProduced.length===0?<div className="before-start-billing">Add Item From the list on the right!</div>:
                            this.createList()
                            }
                        </tbody>
                    </table>
                </div>
                <div className="row meme-date">
                    {billProduced.length===0?null:
                        <div className="bill-bottom-line">
                            <label style={{position:'absolute', paddingTop: 8, left:50, color:'#ffffff', fontWeight:900, fontSize:20, }}>Total : </label>
                            <label style={{textAlign:'left', color:'red', fontWeight:900, fontSize:25, paddingLeft:120, paddingRight:120, paddingTop:3, alignContent:'flex-start'}}>$ {total}</label>
                            <label onClick={this.props.clearBill} style={{position:'absolute', right:50, backgroundColor:'#60c1b9', borderRadius:10, marginTop:2, padding:7, paddingLeft:28, paddingRight:28, color:'#ffffff', fontWeight:900, fontSize:20, }}> PAY </label>
                            </div>
                    }   
                </div>
                
            </div>
		);
    }
    // private clearBill = () => {
	// 	this.props.billProduced.splice(0,this.props.billProduced.length)
	// 	location.reload()
    // }
    private createList(){
        const table:any[] = []
        const itemList = this.props.billProduced;
        for (let i = 0; i < itemList.length; i++) {
            const children = []
            const item = itemList[i]
            
            children.push(<td key={"itemName" + i}><div className="bill-row-item" >{item.itemName}</div></td>)
            children.push(<td key={"itemCount" + i}><div className="bill-row-item" >X  {item.itemCount}</div></td>)
            children.push(<td key={"itemPrice" + i}><div className="bill-row-item" >$  {item.itemPrice * item.itemCount}</div></td>)
            children.push(<td key={"itemDeleter" + i}><div className="bill-row-minus" onClick={this.decrementItem.bind(this, i)} style={{paddingLeft:8, paddingRight:8, paddingTop:3, paddingBottom:3, backgroundColor:'#60c1b9', borderRadius:10,}} >-</div></td>)
            table.push(<tr key={i+""} id={i+""} className="bill-row" >{children}</tr>)
        }
        return table
    }
    private decrementItem = (index: any) => {
        // if ()
        if (this.props.billProduced[index].itemCount >1) {
            this.props.billProduced[index].itemCount = this.props.billProduced[index].itemCount -1;
        } else {
            this.props.billProduced.splice(index,1);
        }
        this.props.selectNewItems(this.props.billProduced)
    }
    
    // private methodNotImplemented() {
	// 	alert("Method not implemented")
	// }

    // Open meme image in new tab
    // private downloadMeme(url: any) {
    //     window.open(url);
    // }
    
}