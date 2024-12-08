import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    exampleCode: new Map([
      ['java', `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}`],
      ['cpp', `#include <stdio.h>
#include <stdlib.h>
      
int main(int argc, char *argv[])
{
  // 请在此输入您的代码
  return 0;
}`],
      ['python3', `import os
import sys

# 请在此输入您的代码
print('hello,ecode')`]
  ]),
    username: '游客',
    
  },
  getters: {
  },
  mutations: {
    setUserName(state,newName) {
      state.username = newName
    }
  },
  actions: {
  },
  modules: {
  }
})
