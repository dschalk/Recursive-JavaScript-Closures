<script>
let j = 40;
</script>

<style>
body {
  font: "Times New Roman";
}
.dropbtn {
  background-color: #361B01;
  color: rgba(51, 232, 238, 0.667);
  padding: 16px;
  font-size: 18px;
  border: none;
}

.dropdown {
  position: relative;
  display: inline-block;
  background-color: #361B01;
}

.dropdown-content {
  display: none;
  position: absolute;
  color: sky-blue;
  min-width: 160px;
  z-index: 1;
  background-color: #361B01;
}

.dropdown-content a {
  color: yellow;
  padding: 12px 16px;
  text-decoration: none;
  display: block;
  background-color: #361B01;
}

.dropdown-content a:hover {color: red; background-color: #361B01;}

.dropdown:hover .dropdown-content {display: block; background-color: #361B01;}

.dropdown:hover .dropbtn {color: red; background-color: #361B01;}
</style>
<span id = "rain">Alice </span>
<span id = "snow">Jane </span>
<div class="dropdown">
  <div class="dropbtn">Dropdown</div>
  <div class="dropdown-content">
    <button on:click = {monad}> A Simple Monad</button>
    <button on:click = {() => j = 2}> A Messaging Monad</button>
    <button on:click = {() => j = 3}> A Promises Monad</button>
    <a href="#rain">Link 2</a>
    <a href="#snow  ">Link 3</a>
  </div>
</div>

