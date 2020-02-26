


<script>
import {fade} from "svelte/transition"
let visible = true;

let GHC_IO = `module GHC.IO.Unsafe (
    unsafePerformIO, unsafeInterleaveIO,
    unsafeDupablePerformIO, unsafeDupableInterleaveIO,
    noDuplicate,
  ) where

import GHC.Base

This is a \"back door\" into the \'IO\' monad, allowing\'IO\' computation to be performed at any time.  For this to be safe, the \'IO\' computation should be free of side effects and independent of its environment.
 `
</script>

<style>

h3 {
    font-size: 27px;
}
#large {
     font-size: 23px;
     color: #aaddff;
}
</style>
{#if visible}
 <div style = "font-family: Times New Roman; text-align: center; color: hsl(210, 90%, 90%); font-size: 32px;" transition:fade>
HASKELL TUTORIAL SUPPLEMENT
 </div>
{/if}

<p> If you are learning to program in Haskell, the book or blog or YouTube video on which you rely might be telling you that mutations can occur only inside of monads or somewhere away from a program such as the command line or a browser. You might be learning that mutations and side effects can occur only in the lazy IO monad. If so, don't believe it. You are being misled.  </p>
<p> Even if you resent being lied to, you might find value in some of the dishonest learning resources. They are trying to teach best practices. Just know know that it is easy to mutate values and types anywhere in a Haskell program. Doing so before you know what your compiler (presumably GHC) will do with your mutations is asking for bugs and crashes.  Here are some unsafe functions with descriptions from their creators and maintainers: </p>
<p id = large> Unsafe.Coerce </p>
<p> The highly unsafe primitive unsafeCoerce converts a value from any type to any other type. If you use this function, avoiding runtime errors will be especially challenging if the old and new types have different internal representations. </p>
<span class = tao> The only function in the Unsafe.Coerce library is unsafeCoerce :: a -> b. You can read more about it at </span>
<a href = "http://hackage.haskell.org/package/base-4.12.0.0/docs/Unsafe-Coerce.html" target = "_blank">Unsafe.Coerce</a>
<br />
<pre> GHC.IO.Unsafe </pre>
<p> If the IO computation wrapped in \'unsafePerformIO\' performs side effects, then the relative order in which those side effects take place (relative to the main IO trunk, or other calls to \'unsafePerformIO\') is indeterminate.  Furthermore, when using \'unsafePerformIO\' to cause side-effects, you should take the following precautions to ensure the side effects are performed as many times as you expect them to be.  Note that these precautions are necessary for GHC, but may not be sufficient, and other compilers may require different precautions. </p>
<span class = tao > For more information, go to </span>
<a href = "http://hackage.haskell.org/package/base-4.12.0.0/docs/src/GHC.IO.Unsafe.html" target = "_blank"> GHC.IO.Unsafe </a>
<br />
<br />
<span class = tao> And here\'s a stub on the Haskell Wiki site that isn\'t generating much interest: </span>
<a href = "https://wiki.haskell.org/Unsafe_functions" target = "_blank" > More on GHC.IO.Unsafe </a>
<span> along with a discussion of mutable global variables in Haskell programs: </span>
<a href = "https://wiki.haskell.org/Top_level_mutable_state" target = "_blank"> Top level mutable state </a>
