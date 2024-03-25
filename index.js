//////////////////Variaveis//////////////////

const inputs = document.querySelectorAll("[data-input]"); //Seleciona todos os inputs do formulario
const infos = document.querySelectorAll("[data-value]"); // Seleciona todos os Spans do HTML que irão receber os valores dos inputs
const cover = document.querySelector(".cover"); //elemento html que faz o quadrado da ficha ficar branco
const instituicao = document.querySelector("#instituicao"); //seleciona o campo instituição para poder preencher automaticamente na linha abaixo
instituicao.value = "Universidade Santa Cecília";

const tipoTrabalho = document.querySelector("#tipoTrabalho"); //seleciona o as opções de tipo de trabalho (TCC, dissertação,etc)
let resultadoSelecao; //variavel que vai ser usada para saber qual tipo de trabalho foi selecionado

const erroText = document.querySelector(".erro"); //seleciona o elemento html erro
let erro; //cria variavel erro para podermos trabalhar com ele

let valores = {}; // Objeto que sera usado para gravas os valores dos inputs

const btnEnviar = document.querySelector(".btn-gerar-ficha"); // Seleciona o botão Gerar Ficha
const btnGerarPDF = document.querySelector(".btn-gerar-pdf"); // Seleciona o botão Gerar PDF
const btnCancelar = document.querySelector(".btn-cancelar"); // Seleciona o botão Gerar PDF

//desabilita botoes para o usuario utilizar somente apos ter preenhido os campos do formulario
btnGerarPDF.disabled = true;
btnCancelar.disabled = true;

//////////////////Funções//////////////////

function gravarValores(e) {
  e.preventDefault(); // Previne padrão do botão do form

  //Realiza loop pelos inputs e registra valores no objeto valores
  inputs.forEach((input) => {
    // verifica se os inputs obrigatorios estão preenchidos, caso não estejam a função não é executada
    if (input.required && input.value) {
      //Lida com o erro do preenchimento
      erroText.classList.remove("ativo");
      input.style.borderColor = "black";
      input.style.boxShadow = "none";
      erro = false;

      //Resgitra os valores digitados no formulario no objeto valores
      const id = input.id;
      const value = input.value;
      valores[id] = value;

      //verifica se tem campos que não sãp obrigatorios e registra os valores no objeto
    } else if (!input.required && input.value) {
      const id = input.id;
      const value = input.value;
      valores[id] = value;
    } else {
      //Informa erro de preenchimento
      erroText.classList.add("ativo");
      erro = true;
      if (!input.value && input.required) {
        input.style.boxShadow = "0px 0px 0px 1px rgba(255,0,0,1)";
        input.style.borderColor = "rgba(255,0,0,1)";
      }
    }
  });

  //usa a função inverter nomes para alterar os nomes
  valores.nomeInvertidoAluno = inverterNomes(
    valores.nomeAluno,
    valores.sobrenomeAluno,
  );
  valores.nomeOrientadorInverido = inverterNomes(
    valores.nomeOrientador,
    valores.sobrenomeOrientador,
  );

  //verifica se o erro esta ativo, não deixa executar a funçaõ de gravar os valores no html
  if (!erro) {
    const estado = valores.estado.toLocaleUpperCase(); //corrige o campo estado caso o usuario digitar com letra minuscula
    valores.estado = estado;

    btnGerarPDF.disabled = false; //habilita botoes
    btnCancelar.disabled = false;

    cover.style.display = "none";
    registrarValoresHTML();
  }
}

//Registra os valores do objeto nos spans no html, verifica atraves do dataset do span se tem o mesmo nome da propriedade do objeto
function registrarValoresHTML() {
  infos.forEach((info) => {
    //seleciona todos os spans e passa o loop
    const dataValue = info.dataset.value;
    if (valores.hasOwnProperty(dataValue)) {
      //compara valores do objeto com os spans e realiza os ajustes necessarios dependendo do assunto do span
      if (info.id) {
        info.textContent = `${info.id} ${valores[dataValue]}.`; //Esse daqui corrige os campos assuntos, permitindo atraves do ID do html adiconar o numero do assunto e colocando um ponto no final da string
      } else if (dataValue === "subtitulo") {
        //corrige o campo subtitulo adicionando a / e o ponto final
        info.textContent = ` : ${valores[dataValue]}`;
      } else if (dataValue === "curso") {
        //verificar qual tipo de curso foi selecionado (tcc, dissertação,etc), para depois escrever a frase correta
        if (resultadoSelecao === "TCC") {
          info.textContent = `Faculdade de ${valores[dataValue]},`;
        } else if (resultadoSelecao !== "TCC") {
          info.textContent = `Programa de pós-graduação em ${valores[dataValue]},`;
        }
      } else if (dataValue === "nomeCoorientador") {
        info.textContent = `Coorientador: ${valores[dataValue]}`;
      } else if (dataValue === "sobrenomeCoorientador") {
        info.textContent = ` ${valores[dataValue]}.`;
      } else if (!info.id) {
        info.textContent = valores[dataValue]; // grava valores dos spans que nao tem ID
      }
    }
  });
}

function gerarPDF() {
  //executa função se o erro nao existir
  if (!erro) {
    //seleciona o que vai virar pdf
    const conteudo = document.querySelector(".ficha");

    //configurações
    const options = {
      margin: [190, 10, 10, 10], // faz a informação ir para o final da pagina a4 do PDF, caso queira deixar no topo, alterar para: 10, 10, 10 ,10
      filename: "ficha catalográfica.pdf",
      html2canvas: { scale: 3 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    //gera pdf e salva
    html2pdf().set(options).from(conteudo).save();
  }
}

//funçaõ que inverte o nome, ela é usda para inverter o nome do aluno e do campo responsabilidade
function inverterNomes(nome, sobrenome) {
  if (nome && sobrenome) {
    const sobreNomeArray = sobrenome.split(" "); // pega a string digitada no sobrenome e divide em varias strings dentro de uma array
    const ultimoNome = sobreNomeArray[sobreNomeArray.length - 1]; //seleciona a ultima string da array criada acima

    if (
      //verifica se a ultima string contem alguma das regras abaixo, e caso possitivo o nome invertido vai ter 2 nomes antes da "," ao inves de 1 nome apenas
      ultimoNome === "Filho" ||
      ultimoNome === "Neto" ||
      ultimoNome === "Junior" ||
      ultimoNome === "Sobrinho" ||
      ultimoNome === "Júnior" ||
      ultimoNome.includes("-")
    ) {
      const nomeDoMeio = sobreNomeArray.slice(0, -2).join(" ");
      const nomePenultimo = sobreNomeArray[sobreNomeArray.length - 2];
      const nomeInvertido = `${nomePenultimo} ${ultimoNome}, ${nome} ${nomeDoMeio}`;

      return nomeInvertido;
    } else {
      //caso seja nome normal inverte o nome com apenas o ultimo antes da ","
      const nomeDoMeio = sobreNomeArray.slice(0, -1).join(" ");
      const nomeInvertido = `${ultimoNome}, ${nome} ${nomeDoMeio}`;
      return nomeInvertido;
    }
  }
}

function cancelar() {
  //zera os valores para o inicial da aplicação
  valores = {};
  infos.forEach((item) => (item.textContent = null));
  inputs.forEach((item) => (item.value = null));
  instituicao.value = "Universidade Santa Cecília";
  cover.style.display = "block";
  btnGerarPDF.disabled = true; //desabilita botoes
  btnCancelar.disabled = true;
}

//função para lidar com a seleçãpo do tipo de curso (tcc,dissertação, etc)
function handleInputCurso() {
  let tipoSelecionado = tipoTrabalho.selectedOptions[0].value;

  if (tipoSelecionado === "TCC") {
    resultadoSelecao = tipoSelecionado;
  } else if (tipoSelecionado !== "TCC") {
    resultadoSelecao = tipoSelecionado;
  }
}

//////////////////Event Listenres//////////////////

btnEnviar.addEventListener("click", gravarValores);
btnGerarPDF.addEventListener("click", gerarPDF);
btnCancelar.addEventListener("click", cancelar);
tipoTrabalho.addEventListener("change", handleInputCurso);
