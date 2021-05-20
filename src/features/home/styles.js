const styles = (theme) => ({
    h1: {
        fontSize: '48px',
        fontWeight: '600',
        lineHeight: '54px',
        color:   theme.palette.type === 'dark' ? '#ffffff' : '#000000',
        padding: '60px 0',
    },
    numberOfVaults: {
        marginTop: 20,
        textTransform: 'uppercase',
        fontSize: '14px',
        fontWeight: 600,
        lineHeight: '18px',
        letterSpacing: '1px',
    },
    item: {
        margin: '20px 0 0 0',
        padding: 0,
        width: '100%',
        background: theme.palette.type === 'dark' ? '#272B4A' : '#faf6f1',
        '&:hover': {
            background: theme.palette.type === 'dark' ? '#272B4A' : '#faf6f1',
        }

    },
    apyBg: {
        background: theme.palette.type === 'dark' ? '#313759' : '#faf6f1',
    },
    roundedLeft: {
        borderTopLeftRadius: '20px',
        borderBottomLeftRadius: '20px',
    },
    roundedRight: {
        borderTopRightRadius: '20px',
        borderBottomRightRadius: '20px',
    },
    h2: {
        fontWeight: 600,
        fontSize: '12px',
        lineHeight: '36px',
        margin: 0,
        padding: 0,
        [theme.breakpoints.up('sm')]: {
            fontSize: '16px',
        },
        [theme.breakpoints.up('lg')]: {
            fontSize: '27px',
        },
    },
    rWidth: {
        minWidth: '80px',
        [theme.breakpoints.up('sm')]: {
            minWidth: '100px',
        },
        [theme.breakpoints.up('md')]: {
            minWidth: '140px',
        },
        [theme.breakpoints.up('lg')]: {
            minWidth: '170px',
        },
    },




    listHeader: {
        marginBottom: '12px',
    },

    itemPaused: {
        backgroundColor: theme.palette.type === 'dark' ? '#8e7800' : '#f5d000',
    },
    itemRetired: {
        backgroundColor: theme.palette.type === 'dark' ? '#751818' : '#e57373',
    },
    itemMessage: {
        fontWeight: 'bold',
        fontSize: '11px',
        position: 'absolute',
        top: '0px',
        left: '0px',
        padding: '1px 12px',
        backgroundColor: 'rgba(0, 0, 0, 0.3)'
    }
});

export default styles;
