var co = require('co')


// co - yieldのPromiseで動くstatemachine。
// ...たまに作ってみたくなりません？
class StateMachine {
  constructor() {
    this._states = {
      _start: (cargo, chunk, idx) => {
        return Promise.resolve({next: 'start', cargo, through: true})
      },
      end: (cargo, chunk, idx) => {
        return Promise.resolve({next: '_done', cargo})
      }
    }
    this._chunks = []
  }

  addState(name, state) {
    this._states[name] = state
  }

  set(chunks) {
    this._chunks = chunks
  }

  _do(state, cargo, idx) {
    let p;
    try {
      let chunk = this._chunks[idx];
      p = state(cargo, chunk, idx)
    }
    catch(e) {
      return Promise.reject(e)
    }
    return p
  }

  run(chunks) {
    const self = this;
    return co(function *() {
      let next='_start', cargo={}, idx=0;
      while(next && next !== '_done') {
        if (!self._states[next]) {
          throw new Error('state not registered')
        }
        let ret = yield self._do(self._states[next], cargo, idx)
        next = ret.next
        cargo = ret.cargo
        idx = ret.through ? idx : idx+1
      }
      return cargo
    })
  }

}


module.exports = StateMachine