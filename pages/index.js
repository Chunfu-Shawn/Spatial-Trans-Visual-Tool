import dynamic from 'next/dynamic';
import Link from 'next/link'
import dataset from '../public/dataset.json' assert { type : 'json' }

const dataset2 = {
    "id": "GSM5833739",
    "name": "GSM5833739",
    "url": "https://rhesusbase.com:9999/datasets/GSM5833739_10x_Visium_deal/GSM5833739_10x_Visium_deal.jsonl"
}

// after ssr and document build
const DynamicVisualTool = dynamic(() =>
        import('../src/VisualTool.js').then((mod) => mod.VisualTool),
    {
        ssr: false,
    })

export default function HomePage() {

    return (
        <div>
            <h3 style={{margin:50}}>Welcome to Spatial-Transcriptome-Visual-Tool!</h3>
            <Link href={"/singleGene"}><a style={{margin:50}}>Click to Single Gene Pattern</a></Link>
            <div style={{margin:50}}>
                <DynamicVisualTool setCustom={true} drawerOpen={false}
                                   width={1200} height={1000}
                                   chartSize={220} dataset={dataset}/>
            </div>
        </div>
    )
}