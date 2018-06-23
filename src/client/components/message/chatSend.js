import React, { Component } from 'react';
import { Input, Icon, Upload, Modal, Progress } from 'antd';
import Tips from '../common/tips';
import ChatShortcut from './chatSendShortcut';
import EmojiPicker from './chatEmoji';
import {cutStr} from '../common/utils';

let shortListIndex=0, shortcutWord;

class ChatSend extends Component{

    constructor(props){
        super(props);
        this.state = {
            isEmojiShow: false,
            isShowProcess: false,
            isShortShow: false,
            socket: props.socket,
            percent: 0,
            textereaValue: "",
            matchText: ';',
            sNum: 0
        };
    }

    textChangeHandle = (e) => {
        this.setState({
            textereaValue: e.target.value.substr(0, 512)
        });
        this.props.statusHandle(1);
    };
    blurHandle = () => {
        let that = this;
        this.props.statusHandle(2);
        setTimeout(function(){
            that.setState({
                isShortShow: false
            });
        }, 500);

    };
    textFocusHandle = () => {
        this.setState({
            isEmojiShow: false
        });
    };

    sendMessage = (e) => {
        e.preventDefault();
        let msgVal = e.target.value;
        let msg = msgVal.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/ /gi, '&nbsp;').replace(/\n/gi, '#');

        if (msgVal.length > 0 && !this.state.isShortShow) {
            this.props.sendMessage(cutStr(msg, 256));
            this.setState({
                isEmojiShow: false,
                textereaValue: ""
            });
        }

    };
    onKeyDown = (e) => {
        if (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 9) {
            e.preventDefault();
        }
    };

    onKeyup = (e) => {
        let tg = e.target;
        let val = tg.value;
        let keyCode = e.keyCode;
        let sIndex = tg.selectionStart;
        let matchVal = val.slice(0, sIndex);
        let matchArr;

        if (keyCode === 38 && this.state.isShortShow) {
            shortListIndex--;
            this.shortcutSelect(-1);
        }
        if (keyCode === 40 && this.state.isShortShow) {
            shortListIndex++;
            this.shortcutSelect(1);
        }

        if (/(\s;\w*)|(^;\w*)/.test(matchVal)) {
            matchArr = matchVal.match(/(\s;\w*)|(^;\w*)/g);
            this.shortcutFilter(matchArr);
        } else {
            this.setState({
                isShortShow: false
            });
        }

        if (keyCode === 9 || keyCode === 13) {
            if (document.querySelector('.short-list .on')) {
                this.insertToCursorPosition(val.replace(new RegExp(shortcutWord, 'g'), ''), document.querySelector('.short-list .on .key-value').innerHTML+' ');
            }
            this.setState({
                isShortShow: false
            });
        }
    };

    shortcutFilter = (matchArr) => {
       let shortcutLists = localStorage.getItem("shortcutList") || [];
       let mtext = matchArr[matchArr.length - 1].replace(' ', '');
       let isShortShow = false;
       let matchReg = new RegExp(mtext.slice(1), 'ig');

        shortcutWord = mtext;

        if (shortcutLists.length > 0) {
            shortcutLists = JSON.parse(shortcutLists);
            for (let i = 0, l = shortcutLists.length; i < l; i++) {
                if (matchReg.test(shortcutLists[i].shortcut)) {
                    isShortShow = true;
                    break;
                }
            }
        } else {
            isShortShow = true;
        }

        this.setState({
            matchText: mtext,
            isShortShow: isShortShow
        });
    };

    shortcutMouseover = (i) => {
        shortListIndex = i;
    };

    shortcutSelectClick = (val) => {
        this.insertToCursorPosition(this.state.textereaValue.replace(new RegExp(shortcutWord, 'g'), ''), val);
    };

    shortcutSelect = (direction) => {
        if (document.querySelector('.shortListUl li')) {
            let h = document.querySelector('.shortListUl li').offsetHeight;
            let list = document.querySelectorAll('.shortListUl li');
            let len = list.length;
            let shortList = document.querySelector('.short-list');

            if (direction === 1) {
                if (shortListIndex*h >= shortList.offsetHeight) {
                    shortList.scrollTop += direction*h;
                }
                if (shortListIndex*h >= shortList.scrollHeight) {
                    shortList.scrollTop = 0;
                    shortListIndex = 0;
                }
            } else {
                if (shortListIndex < 0) {
                    shortListIndex = len - 1;
                    shortList.scrollTop = shortListIndex * h;
                }
                if ((shortListIndex + 1) *h <= shortList.scrollTop) {
                    shortList.scrollTop += direction*h;
                }
            }
            for (let i = 0; i < len; i++) {
                if (i === shortListIndex) {
                    list[i].className += ' on';
                } else {
                    list[i].className = 's-'+i;
                }
            }
        }
    };

    emojiBtnHandle = () => {
        this.setState({
            isEmojiShow: !this.state.isEmojiShow
        });
    };

    addEmojiHandle = (emoji) => {
        this.insertToCursorPosition(this.state.textereaValue, emoji);
    };

    insertToCursorPosition = (s1, s2) => {
        let obj = document.getElementsByClassName("chat-textarea")[0];
        obj.focus();

        if (document.selection) {
            let sel = document.selection.createRange();
            sel.text = s2;
        } else if (typeof obj.selectionStart === 'number' && typeof obj.selectionEnd === 'number') {
            let startPos = obj.selectionStart;
            let endPos = obj.selectionEnd;
            let cursorPos = startPos;
            let tmpStr = s1;
            let s3 = tmpStr.substring(0, startPos) + s2 + tmpStr.substring(endPos, tmpStr.length);

            this.setState({
                textereaValue: s3
            });
            cursorPos += s2.length;
            obj.selectionStart = obj.selectionEnd = cursorPos;
        } else {
             this.setState({
                textereaValue: this.state.textereaValue+ s2 +" "
             });
        }
    };
    rateHandle = () => {
        let {socket, cid, rateFeedBack} = this.props;

        Modal.confirm({
            title: 'Invite user rate',
            okText: 'Yes',
            cancelText: 'Cancel',
            content: (
                <p>Are you sure invite the user rate?</p>
            ),
            onOk(){
                socket && socket.emit('cs.rate', cid, function(success){
                    if (success) {
                        rateFeedBack();
                    }

                });
            }
        });
    };

    beforeUpload = (file) => {
        let isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            Tips.error('Image must smaller than 2MB!');
        }
        if (!/(.jpg|.png|.gif|.jpeg)/g.test(file.name)) {
            Tips.error('Image type must be jpg、jpeg、png、gif!');
            isLt2M = false;
        }
        return isLt2M;
    };

    render(){
        let {sendMessage, cid, csid} = this.props;
        let {percent, isShowProcess, isEmojiShow, textereaValue, isShortShow, matchText} = this.state;
        let _self = this;
        let props = {
                name: 'image',
                action: '/messages/customer/'+cid+'/cs/'+csid+'/image',
                accept: 'image/*',
                headers: {
                    authorization: 'authorization-text'
                },
                beforeUpload: _self.beforeUpload,
                onChange(info) {
                    let status = info.file.status;

                    if (status === 'uploading') {
                        if (info.event){
                            _self.setState({
                                isShowProcess: true,
                                percent: Math.ceil(info.event.percent)
                            });
                        }
                    } else if (status === 'done') {
                        if (info.file.response.code === 200) {
                            sendMessage(info.file.response.msg.resized+'|'+info.file.response.msg.original+'|'+info.file.response.msg.w+'|'+info.file.response.msg.h);
                        }
                        setTimeout(function(){
                            _self.setState({
                                isShowProcess: false
                            });
                        }, 2000);
                    } else if (status === 'error') {
                        Tips.error(info.file.name+' file upload failed.', 6, function(){
                            _self.setState({
                                isShowProcess: false
                            });
                        });
                    }
                }
            };

        if (!isShortShow) {
            shortListIndex = 0;
        }

        return (
            <div className="chat-send">
                <Progress type="circle" percent={percent} className="upload-process" width={60} style={{display: isShowProcess ? 'block' : 'none'}} />
                <div className="send-tools">
                    <div className="tool-box tool-emoji">
                        <Icon onClick={this.emojiBtnHandle} className={"emoji-icon "+(isEmojiShow ? 'active' : '')} />
                        {
                            isEmojiShow &&  <EmojiPicker addEmojiHandle={this.addEmojiHandle} onChange={this.addEmojiHandle} />
                        }
                    </div>
                    <div className="tool-box">
                        <Upload {...props}>
                            <Icon type="folder" className="upload-icon" />
                        </Upload>
                    </div>
                    <div className="tool-box">
                        <span className="rate-icon" title="Invite user evaluation" onClick={this.rateHandle}></span>
                    </div>
                </div>
                <div className="chat-text">
                {isShortShow && <ChatShortcut shortcutSelectClick={this.shortcutSelectClick} csid={csid} matchText={matchText} shortcutMouseover={this.shortcutMouseover} />}
                <Input.TextArea
                    className="chat-textarea"
                    onPressEnter={this.sendMessage}
                    placeholder="Enter message.Type ; to bring up shortcuts."
                    onChange={this.textChangeHandle}
                    onKeyUp={this.onKeyup}
                    onKeyDown={this.onKeyDown}
                    value={textereaValue}
                    onFocus={this.textFocusHandle}
                    onBlur={this.blurHandle}
                    maxLength="256"
                    />
                </div>
            </div>
        );
    }
}

export default ChatSend;