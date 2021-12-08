<template>
  <div class="home" style="border: 1px solid blue;background: beige;width: 1400px;margin-left: auto;margin-right: auto">
    <el-form ref="docForm" :model="docForm" style="margin-top: 6px;font-size: 16px;font-weight: bold" label-width="300px" :rules="rules">
      <el-form-item label="导出文件名称:" prop="docName">
        <el-input v-model="docForm.docName" class="el-input" clearable></el-input>
      </el-form-item>
      <el-form-item label="导出文件路径:" prop="docOutDir">
        <el-input v-model="docForm.docOutDir" class="el-input" clearable></el-input>
      </el-form-item>
      <el-form-item label="导出文件类型:" prop="docType">
        <el-select v-model="docForm.docType" class="el-input">
          <el-option label="word格式" value="doc"></el-option>
          <el-option label="html格式" value="html"></el-option>
          <el-option label="markdown格式" value="md"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="忽略数据库表:">
          <el-input class="el-input" v-model="docForm.ignoreTables" clearable placeholder="多表时请用逗号','分隔"></el-input>
      </el-form-item>
      <el-form-item label="忽略表前缀:">
          <el-input class="el-input" v-model="docForm.ignorePrefix" clearable placeholder="多前缀时请用逗号','分隔"></el-input>
      </el-form-item>
      <el-form-item label="忽略表后缀:">
          <el-input class="el-input" v-model="docForm.ignoreSuffix" clearable placeholder="多后缀时请用逗号','分隔"></el-input>
      </el-form-item>
      <el-form-item style="text-align: center">
        <el-button type="primary" @click="generateDoc">生成文档</el-button>
        <el-button type="primary" @click="showOnLineDoc">在线浏览</el-button>
        <el-button>取消</el-button>
      </el-form-item>
    </el-form>
  </div>
  <div v-show="showOnlineDoc">
     <div ref="showFile"></div>
  </div>
  <div v-html="fileContent">
  </div>
</template>
<script>
import request from "@/utils/request";
import {ElMessage} from "element-plus";
import Axios from "axios";
import XLSX from "xlsx";
let docx = require('docx-preview');

export default {
  name: 'Home',
  data(){
    return{
      showOnlineDoc: false,
      workbook: {},
      fileContent: "",
      docForm:{
        docType:"doc",
        docName:"",
        docOutDir:"",
        ignoreTables:"",
        ignorePrefix:"",
        ignoreSuffix:"",
      },
      rules: {
        docName: [
          {required: true, message: '请输入导出文件名称', trigger: 'blur'}
        ],
        docOutDir: [
          {required: true, message: '请输入导出文件路径', trigger: 'blur'}
        ],
        docType: [
          {required: true, message: '请选择导出文件类型:', trigger: 'blur'}
        ],
      }
    }
  },
  methods:{
    generateDoc(){
      this.$refs["docForm"].validate((valid) => {
        if (valid) {
          request.post("/doc/generate.do",this.docForm).then((res)=>{
            debugger;
            if (res.code === 200){
              ElMessage.success({
                message: res.msg,
                type: 'success'
              });
            } else {
              ElMessage.success({
                message: res.msg,
                type: 'error'
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    showOnLineDoc(){
      const fileName = "工程建设项目审批管理系统操作手册_V3.5.doc";
      Axios ({
        method: 'get',
        responseType: 'blob',
        url: 'minio/getFileInputStream.do/' + fileName,
      }).then(({data}) => {
          debugger;
          this.showOnlineDoc = true;
          const suffix = fileName.substr(fileName.lastIndexOf(".") + 1,fileName.length);
          if ("doc" === suffix || "docx" === suffix){
            docx.renderAsync(data,this.$refs.showFile);
          } else {
            const reader = new FileReader();
            reader.onload = e => {
              //预处理
              let binary = '';
              const buf = new Uint8Array(e.target.result);
              const length = buf.byteLength;
              for (let i = 0; i < length; i++) {
                binary += String.fromCharCode(buf[i]);
              }  //读取excel
              const wb = XLSX.read(binary, {type: "binary"});
              console.log("wb",wb);
              //抓取第一个sheet
              let sheetName = wb.SheetNames[0];
              let ws = wb.Sheets[sheetName];
              // setContent 是用来赋值 this.fileContent = xlsx.utils.sheet_to_html(ws)
              this.fileContent = XLSX.utils.sheet_to_html(ws);
            };
            reader.readAsArrayBuffer(data);
          }
      });
    },
  }
}
</script>
<style scoped>
.el-input{
  width: 1000px;
}
</style>
