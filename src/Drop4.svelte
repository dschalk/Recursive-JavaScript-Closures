<style>
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

<p id = "a">a</p>
<p id = "b">b</p>
<p id = "c">c</p>


<div class="dropdown">
  <div class="dropbtn">Dropdown</div>
  <div class="dropdown-content">
    <a href="#a">Link 1</a>
    <a href="#b">Link 2</a>
    <a href="#c">Link 3</a>
  </div>
</div>

