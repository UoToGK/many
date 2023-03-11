//Created by uoto on 16/7/1.
import { EventEmitter } from "events";
import { writeLog2File } from "./base/logger";

export class Socket extends EventEmitter {
  public ws: WebSocket;

  constructor(public host) {
    super();
    this.connect();
  }

  /**
   * CLOSED : 3
   * CLOSING : 2
   * CONNECTING : 0
   * OPEN : 1
   */
  get readyState() {
    if (this.ws) {
      return this.ws.readyState;
    }
    return undefined;
  }

  private retime = 1;

  // 重连
  private _reconnect() {
    if (this.readyState > 1) {
      writeLog2File(`当前连接状态：${this.readyState}`);
      setTimeout(() => {
        writeLog2File(`websocket reconnecting,连接频率: ${this.retime}`);
        this.connect();
      }, 31 * 1000);

      if (this.retime < 5) {
        // 刚开始1秒后即重连,如果无法连接,
        // 则每次递增1秒,直到5秒后,保持5秒的尝试连接频率
        this.retime++;
      }
    }
  }

  connect() {
    this.ws = new WebSocket(this.host);
    writeLog2File(`websocket link:${this.host}`);

    let timer;
    this.ws.onopen = e => {
      clearTimeout(timer);
      this.emit("open", e);
      this.retime = 1;
      writeLog2File(`websocket onopen`, "", e);
      while (this._sendHolderList.length) {
        this.ws.send(this._sendHolderList.pop());
      }
    };
    this.ws.onclose = e => {
      clearTimeout(timer);
      writeLog2File(`websocket onclose`, "", e);
      this._reconnect();
      this.emit("close", e);
    };
    this.ws.onmessage = e => {
      this.emit("message", e);
      writeLog2File(`websocket onmessage`, "", e);
      try {
        let data = JSON.parse(e.data);
        if (data && data["event"]) {
          this.emit(data["event"], e, data);
        }
      } catch (e) {}
    };
    this.ws.onerror = e => {
      this.emit("error", e);
      writeLog2File(`websocket error`, "", e);
      clearTimeout(timer);
      this._reconnect();
    };
    // 如果一定时间内无法连接,则尝试重连
    timer = setTimeout(() => {
      this._reconnect();
    }, 30 * 1000);
  }

  _sendHolderList = [];

  send(data) {
    if (this.ws && this.readyState == 1) {
      this.ws.send(JSON.stringify(data));
      //   writeLog2File(`websocket 传送数据`, "", data);
    } else {
      this._sendHolderList.push(JSON.stringify(data));
    }
  }
}
