const styles = theme => ({
    headerTabs: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        [theme.breakpoints.up('lg')]: {
            flexDirection: 'row',
            alignItems: 'center',
        }
    },
    headerTab: {
        marginTop: 10,
        [theme.breakpoints.up('lg')]: {
            marginTop: 0,
            marginLeft: 20,
        }
    }
});

export default styles;
