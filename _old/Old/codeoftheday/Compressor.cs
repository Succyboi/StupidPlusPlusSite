/*
* A simple single band compressor for Unity3D.
*
* https://unity.com/
*/

/*
* Compressor.cs by Pelle "Stupid++" Bruinsma
* 
* To the extent possible under law, the person who associated CC0 with
* Compressor.cs has waived all copyright and related or neighboring rights
* to Compressor.cs.
* 
* You should have received a copy of the CC0 legalcode along with this
* work.  If not, see http://creativecommons.org/publicdomain/zero/1.0/.
*/

using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Compressor : MonoBehaviour
{
    [Range(0, 1)]
    public float treshold;
    [Range(1, 8)]
    public float ratio;
    public float attack;
    public float release;
    [Range(0, 1)]
    public float makeup;

    private float gain = 1;

    private int sampleRate = 0;

    private void Start()
    {
        sampleRate = AudioSettings.outputSampleRate;
    }

    private void OnAudioFilterRead(float[] data, int channels)
    {
        float sampleTime = SampleTimeInSeconds(data.Length, channels, sampleRate);

        for (int d = 0; d < data.Length; d++)
        {
            float value = data[d];

            if (Mathf.Abs(value) > treshold)
            {
                gain = Mathf.Lerp(gain, 1 / ratio, sampleTime / data.Length * channels / (attack / 1000)); //divide by 1000 for miliseconds
            }
            else
            {
                gain = Mathf.Lerp(gain, 1, sampleTime / data.Length * channels / (release / 1000));
            }

            value *= gain;

            data[d] = Mathf.Clamp(value * (makeup + 1), -1, 1);
        }
    }

    private float SampleTimeInSeconds(int sampleLength, int channels, int sampleRate)
    {
        return ((float)sampleLength / (float)channels) / (float)sampleRate;
    }
}