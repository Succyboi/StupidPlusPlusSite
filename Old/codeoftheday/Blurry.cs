/*
* A visual effect to set specific resolutions for Unity3D.
* 
* https://unity.com/
*/

/*
* Blurry.cs by Pelle "Stupid++" Bruinsma
* 
* To the extent possible under law, the person who associated CC0 with
* Blurry.cs has waived all copyright and related or neighboring rights
* to Blurry.cs.
* 
* You should have received a copy of the CC0 legalcode along with this
* work.  If not, see http://creativecommons.org/publicdomain/zero/1.0/.
*/

using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Blurry : MonoBehaviour
{
    public int horizontalResolution;
    public int verticalResolution;

	public void OnRenderImage(RenderTexture src, RenderTexture dest)
	{
		horizontalResolution = Mathf.Clamp(horizontalResolution, 1, 2048);
		verticalResolution = Mathf.Clamp(verticalResolution, 1, 2048);

		RenderTexture scaled = RenderTexture.GetTemporary(horizontalResolution, verticalResolution);
		scaled.filterMode = FilterMode.Point;
		Graphics.Blit(src, scaled);
		Graphics.Blit(scaled, dest);
		RenderTexture.ReleaseTemporary(scaled);
	}
}