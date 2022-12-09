import dynamic from 'next/dynamic';
import Link from "next/link";
import dataset from "../public/dataset.json" assert { type : 'json' };
import {useState} from "react";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";

const dataset2 = {
    "id": "STW-H-Uterus-Visium-1",
    "name": "STW-H-Uterus-Visium-1",
    "url": "https://rhesusbase.com:9999/jsonl_files/STW-H-Uterus-Visium-1/EarlySecretory_152807/EarlySecretory_152807.jsonl"
}

function firstUpperCase(str) {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}
const DynamicGeneExpress = dynamic(() =>
        import('../src/SingleGeneExpressionModule.js').then(
            (mod) => mod.SingleGeneExpressionModule),
    {
        ssr: false,
    })

export default function SingleGene() {
    const [gene,setGene] = useState('gap43')
    // after ssr and document build
    const [state, setState] = useState(false);

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setState(open);
    };

    return (
        <div style={{margin:50}}>
            <h3 >Welcome to Spatial-Transcriptome-Visual-Tool!</h3>
            <Link href={"/"}><a>Back to Home</a></Link>
            <Button onClick={toggleDrawer(true)}>{"right"}</Button>
            <Drawer
                anchor={"right"}
                open={state}
                onClose={toggleDrawer(false)}
            >
                <DynamicGeneExpress setCustom={true} width={400} height={400} dataset={dataset} gene={firstUpperCase(gene)}/>
            </Drawer>
            <h3>{gene} expression pattern</h3>
            <div style={{display:"flex",flexFlow:"row wrap",justifyContent: "space-between"}}>
                <DynamicGeneExpress setCustom={true} width={400} height={400} dataset={dataset} gene={firstUpperCase(gene)}/>
                <DynamicGeneExpress setCustom={true} width={400} height={400} dataset={dataset2} gene={'BRCA1'}/>
            </div>
        </div>
    )
}