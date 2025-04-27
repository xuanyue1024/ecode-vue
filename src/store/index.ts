import Vue from 'vue'
import Vuex from 'vuex'

import createPersistedState from 'vuex-persistedstate';//vuex持久化插件

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    exampleCode: {
      'java': `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, ecode");
  }
}`,
      'cpp': `#include <iostream>

int main() {
  std::cout << "hello, ecode" << std::endl;
  return 0;
}`,
      'python3': `import os
import sys

# 请在此输入您的代码
print('hello,ecode')`,
      'swift': `import Swift

print("hello, ecode")`,
      'rust': `fn main() {
  println!("hello, ecode");
}`,
      'php': `<?php
echo 'hello, ecode';
?>`,
      'nodejs': `console.log('hello, ecode');`,
      'kotlin': `fun main() {
  println("hello, ecode")
}`,
      'go': `package main
  
import "fmt"
  
func main() {
  fmt.Println("hello, ecode")
}`,
      '.net': `using System;
  
class Program {
  static void Main() {
    Console.WriteLine("hello, ecode");
  }
}`
    } as const,
    username: '游客',
    userRole: '' as string,
    name: '' as string
  },
  getters: {
    getExampleCode: (state) => (language: keyof typeof state.exampleCode) => {
      return state.exampleCode[language] || ''
    }
  },
  mutations: {
    setUserName(state,newName) {
      state.username = newName
    },
    setUserRole(state, newName) {
      state.userRole = newName;
    },
    setName(state, newName) {
      state.name = newName;
    }
  },
  actions: {
  },
  modules: {
  },
  plugins: [
    createPersistedState({
      key: 'my-vuex-app', // 存储的键名
      storage: window.localStorage, // 也可以使用 sessionStorage
    })
  ]
})
