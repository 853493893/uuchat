import React, { Component } from 'react';
import { Modal } from 'antd';
import String2int from '../common/utils';

class Chat extends Component{

    constructor(){
        super();
        this.state={
            isOfflineShow: false
        };
    }

    msgFilter(msg){
        let imgReg = /[a-zA-Z0-9.%=/]{1,}[.](jpg|png|jpeg|gif)/g,
            m = msg.replace && msg.replace(/#/gi, "<br />");

        if (msg.replace && imgReg.test(m)) {
            return  <img src={'/'+msg.split('|')[0]} alt="" />;
        }
        return <span dangerouslySetInnerHTML={{__html: m}}></span>;
    }
    offlineShow = () => {
        let isOfflineShow = this.state.isOfflineShow;

        this.setState({
            isOfflineShow: !isOfflineShow
        });
    };

    render(){

        let {cid, name, type, newMsg, isActive, num, email, marked, closeDialog, onChatListClick } = this.props.options,
            msg,
            cIndex = String2int(cid);

        if (!type) {

            if (newMsg && newMsg.length > 0 ) {
                msg = newMsg[newMsg.length - 1];
            }
            return (
                <li onClick={(e) => onChatListClick(name, cid, marked)} className={ isActive  ? 'active' : ''}>
                    <div className="chat-avatar fl">
                        <span className={"avatar-icon avatar-icon-"+cIndex}>{name.substr(0,1).toUpperCase()}</span>
                    </div>
                    <div className="chat-news fr">
                        <h2 className="text-overflow">U-{name.toUpperCase()}</h2>
                        <p className="text-overflow">{msg && this.msgFilter(msg.msgText)}</p>
                    </div>
                    <div className="chat-close" onClick={(e)=>closeDialog(e, cid, 'chat')}>╳</div>
                    <div className="chat-notify" style={{display: (isActive || num === 0) ? 'none' : 'inline-block'}}>{num}</div>
                </li>
             );
        } else if (type) {

            return (
                <li onClick={this.offlineShow}>
                    <div className="chat-avatar fl">
                        <span className={"avatar-icon avatar-icon-"+cIndex}>{cid.substr(0,1).toUpperCase()}</span>
                    </div>
                    <div className="chat-news fr">
                        <h2 className="text-overflow">U-{cid.substr(0,6).toUpperCase()}</h2>
                        <p className="text-overflow">Offline message </p>
                    </div>
                    <div className="chat-close" onClick={(e)=>closeDialog(e, cid, 'offline')}>╳</div>
                    <div className="chat-notify">Offline message </div>
                    <Modal
                        title={'U-'+cid.substr(0,6).toUpperCase()+' message offline'}
                        visible={this.state.isOfflineShow}
                        footer={null}
                        onCancel={this.offlineShow}
                    >
                        <div>
                            <h1 className="chat-offline-msg">Content: {email.content}</h1>
                            <h2 className="chat-offline-t">Name: {email.name}</h2>
                            <h3 className="chat-offline-t">Email: {email.email}</h3>
                        </div>
                    </Modal>
               </li>
            );
        }
    }
}


export default Chat;