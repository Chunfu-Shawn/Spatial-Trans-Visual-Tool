import {StyledEngineProvider, ThemeProvider} from '@mui/material/styles';
import {createTheme} from '@mui/material';
import SingleGeneExpression from "./SingleGeneExpression";

const darkTheme = createTheme({palette: {mode: 'dark'}});
const lightTheme = createTheme({palette: {mode: 'light'}});

export default function SingleGeneExpressionWrapper() {

    return (
        <StyledEngineProvider>
            <ThemeProvider theme={lightTheme}>
                <SingleGeneExpression />
            </ThemeProvider>
        </StyledEngineProvider>
    );
}
